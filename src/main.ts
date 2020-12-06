import { readFileSync } from 'fs';

import { GrammarParser, TokenParser } from './parser';
import { AFND } from './afnd';

function getGrammar(): string {
  return readFileSync('./input/gramatica.txt').toString();
}

function getTokens(): string {
  return readFileSync('./input/tokens.txt').toString();
}

function setup() {
  const grammarInput = getGrammar();
  const tokensInput = getTokens();

  const grammar = GrammarParser(grammarInput);
  const tokens = TokenParser(tokensInput);

  const afnd = new AFND();

  afnd.setTokens(tokens);
  afnd.setGrammar(grammar);

  afnd.runTokens();
  afnd.runGrammar();

  afnd.printTable();
  // Entrada por terminal
}


setup();