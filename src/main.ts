import { readFileSync } from 'fs';

import { GrammarParser, TokenParser } from './parser';
import { AFND } from './afnd';
import { AFD } from './afd';

function getGrammar(): string {
  return readFileSync('./input/gramatica.txt').toString();
}

function getTokens(): string {
  return readFileSync('./input/tokens.txt').toString();
}

function setup(grammarInput: string, tokensInput: string) {
  const grammar = GrammarParser(grammarInput);
  const tokens = TokenParser(tokensInput);

  const afnd = new AFND();
  const afd = new AFD();

  afnd.setTokens(tokens);
  afnd.setGrammar(grammar);

  afnd.runTokens();
  afnd.runGrammar();

  afnd.printTable();

  afd.setState(afnd.getState());
  afd.setAlphabet(afnd.getAlphabet());
  afd.setVariables(afnd.getVariables());

  afd.convertToDetermined();

  afd.printTable();
}

function bootstrapWithDefinedInputs() {
  const grammarInput = getGrammar();
  const tokensInput = getTokens();

  setup(grammarInput, tokensInput);
}


bootstrapWithDefinedInputs();