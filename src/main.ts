import { readFileSync } from 'fs';

import { GrammarParser, TokenParser } from './parser';
import { AFND } from './afnd';
import { AFD } from './afd';
import { Analyzer } from './analyzer';

function getGrammar(): string {
  return readFileSync('./input/gramatica.txt').toString();
}

function getTokens(): string {
  return readFileSync('./input/tokens.txt').toString();
}

function getSourceCode(): string {
  return readFileSync('./input/source.txt').toString();
}

function setup(grammarInput: string, tokensInput: string, sourceCodeInput: string): { afd: AFD, afnd: AFND, analyzer: Analyzer } {
  const grammar = GrammarParser(grammarInput);
  const tokens = TokenParser(tokensInput);

  const afnd = new AFND();
  const afd = new AFD();
  const analyzer = new Analyzer();

  afnd.setTokens(tokens);
  afnd.setGrammar(grammar);

  afnd.runTokens();
  afnd.runGrammar();

  afd.setState(afnd.getState());
  afd.setAlphabet(afnd.getAlphabet());
  afd.setVariables(afnd.getVariables());

  afd.convertToDetermined();
  afd.createErrorState();

  analyzer.setSourceCode(sourceCodeInput);
  analyzer.setAFD(afd);
  analyzer.analyzeSource();

  return { afnd, afd, analyzer };
}

function bootstrapWithDefinedInputs() {
  const grammarInput = getGrammar();
  const tokensInput = getTokens();
  const sourceCodeInput = getSourceCode();

  const { afnd, afd, analyzer } = setup(grammarInput, tokensInput, sourceCodeInput);
  afd.printTable();
  console.log(analyzer.getOutput());
}


bootstrapWithDefinedInputs();