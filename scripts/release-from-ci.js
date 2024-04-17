module.exports = async ({ github, context, exec }) => {
  const isPrerelease = process.env.PRERELEASE === 'true';

  console.log('Step 1. Apply version changes to all packages');
  const versionApplyArgs = ['version', 'apply', '--all', '--json'];
  if (isPrerelease) {
    versionApplyArgs.push('--prerelease');
  }
  const { stdout: ndjson } = await exec.getExecOutput('yarn', versionApplyArgs);
  const versions = ndjson
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line));
  console.log('Releasing versions:', versions);

  const versionStrings = versions.map((v) => `${v.ident}@${v.newVersion}`);

  console.log('Step 2. Create a release commit');

  // Commiting using the GitHub action bot
  // More info here: https://github.com/actions/checkout/issues/13#issuecomment-724415212
  await exec.exec('git', [
    'config',
    '--global',
    'user.email',
    '41898282+github-actions[bot]@users.noreply.github.com',
  ]);
  await exec.exec('git', [
    'config',
    '--global',
    'user.name',
    'github-actions[bot]',
  ]);

  await exec.exec('git', ['add', '.']);
  await exec.exec('git', [
    'commit',
    '-m',
    `chore: release ${versionStrings.join(', ')}`,
  ]);
  await exec.exec('git', [
    'push',
    'origin',
    process.env.GITHUB_REF_NAME || `main`,
  ]);

  console.log('Step 3. Publish changed packages');
  await exec.exec('yarn', [
    'workspaces',
    'foreach',
    '-pt',
    '--since',
    context.ref, // Check diff of the release commit
    'npm',
    'publish',
  ]);

  console.log('Step 4. Create release');
  const { stdout: targetCommitish } = await exec.getExecOutput('git', [
    'rev-parse',
    'HEAD',
  ]);
  console.log(`Using commit ${targetCommitish} as release ref`);

  const release = await github.rest.repos.createRelease({
    owner: context.repo.owner,
    repo: context.repo.repo,
    tag_name: `${versions[0].ident}@${versions[0].newVersion}`,
    target_commitish: targetCommitish,
    name: versionStrings.join(', '),
    prereleasee: isPrerelease,
    generate_release_notes: true,
  });
  console.log('Release created:', release);
};
