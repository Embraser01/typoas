#!/usr/bin/env node
import { Cli } from 'clipanion';
import cli from './index.js';

const [, , ...args] = process.argv;

void cli.runExit(args, Cli.defaultContext);
