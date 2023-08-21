#!/usr/bin/env node
import { Cli } from 'clipanion';
import cli from './index';

const [, , ...args] = process.argv;

cli.runExit(args, Cli.defaultContext);
