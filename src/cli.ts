#!/usr/bin/env node
import { main } from "./cli/run.js";

void main().then((code) => { process.exitCode = code; });
