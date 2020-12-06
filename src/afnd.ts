import { IRule } from './models/rule.model';
import { IVariableMap } from './models/variable-map.model';
import {
    ASCII_A_VALUE,
    ASCII_S_VALUE,
    ASCII_Z_VALUE,
} from './consts';
import { ConditionType } from './models/condition.enum';

export class AFND {
    private tokens: string[];
    private grammar: IRule[];
    private state: string[][][] = [[]];

    private alphabetMap: { [key: string]: number } = {};
    private variablesMap: { [key: string]: IVariableMap } = {};

    private isAlphabetMapped(alphabet: string): boolean {
        return Object.keys(this.alphabetMap).indexOf(alphabet) >= 0;
    }

    private isVariableMapped(variable: string): boolean {
        return Object.keys(this.variablesMap).indexOf(variable) >= 0;
    }

    private sanitizeAlphabet(alphabet: string): string {
        return `_${alphabet}`;
    }

    private rawAlphabet(alphabet: string): string {
        if (alphabet.charAt(0) == '_')
            return alphabet.substr(1);

        return alphabet;
    }

    private getAndMapAlphabetPosition(alphabet: string): number {
        const sanitizedAlphabet = this.sanitizeAlphabet(alphabet);
        if (!this.isAlphabetMapped(sanitizedAlphabet)) {
            this.alphabetMap[sanitizedAlphabet] = Object.keys(this.alphabetMap).length;
        }

        return this.alphabetMap[sanitizedAlphabet];
    }

    private getAndMapVariablePosition(variable: string, isTerminal: boolean = false): number {
        if (!this.isVariableMapped(variable)) {
            this.variablesMap[variable] = {
                Value: Object.keys(this.variablesMap).length,
                IsTerminal: isTerminal
            };
        }

        return this.variablesMap[variable].Value;
    }

    private generateVariable(variablesCount: number): string {
        if (variablesCount < 0)
            return String.fromCharCode(ASCII_S_VALUE);

        let nextVariableASCIICode = ASCII_A_VALUE + variablesCount;
        if (nextVariableASCIICode >= ASCII_S_VALUE)
            nextVariableASCIICode++;

        let prefix = '';
        if (nextVariableASCIICode > ASCII_Z_VALUE) {
            const decreaseTimes = Math.floor(nextVariableASCIICode / ASCII_Z_VALUE) - 1;
            prefix = this.generateVariable(decreaseTimes);
            nextVariableASCIICode = nextVariableASCIICode - (ASCII_Z_VALUE - ASCII_A_VALUE) - 1;
        }

        return prefix + String.fromCharCode(nextVariableASCIICode);
    }

    private getVariable(isFirstVariable: boolean = false, isTerminal: boolean = false): string {
        const variablesCount = Object.keys(this.variablesMap).length - 1;
        const variable = this.generateVariable(!isFirstVariable ? variablesCount : -1);

        this.getAndMapVariablePosition(variable, isTerminal);
        return variable;
    }

    private setStatePosition(i: number, j: number, value: string) {
        if (this.state[i] == undefined)
            this.state[i] = [];

        const coordinateValue = this.state[i][j] || [];
        coordinateValue.push(value);

        this.state[i][j] = coordinateValue;
    }

    setTokens(tokens: string[]) {
        this.tokens = tokens;
    }

    setGrammar(grammar: IRule[]) {
        this.grammar = grammar;
    }

    printTable() {
        let stateClone = JSON.parse(JSON.stringify(this.state));

        const varsKeys = Object.keys(this.variablesMap);
        const stateClone2: any[] = [['#', ...(Object.keys(this.alphabetMap).map(v => this.rawAlphabet(v)))]];
        for (let i in varsKeys) {
            const varColumn = varsKeys[i] + (this.variablesMap[varsKeys[i]].IsTerminal ? '*' : '');
            stateClone2.push([varColumn, ...((stateClone[i] || []).map(v => (v || [' ']).join('')))]);
        }

        console.table(stateClone2);
    }

    runTokens() {
        for (let token of this.tokens) {
            let lastVariable = this.getVariable(true);

            for (let i = 0, s = token.length; i < s; i++) {
                let alphabet = token[i];
                const isLastCharater = i == (s - 1);

                const variable = this.getVariable(false, isLastCharater);
                const lastVariableIndex = this.getAndMapVariablePosition(lastVariable);
                const alphabetIndex = this.getAndMapAlphabetPosition(alphabet);

                lastVariable = variable;

                this.setStatePosition(lastVariableIndex, alphabetIndex, variable);
            }
        }
    }

    runGrammar() {
        // S::=0A|1A
        // 
        // [
        //     [ { Content: '0', Type: Alphabet }, { Content: 'A', Type: Variable } ],
        //     [ { Content: '1', Type: Alphabet }, { Content: 'A', Type: Variable } ]
        // ]

        let initialVariable = this.getVariable(true);
        const variablesRemap: { [key: string]: string } = {};

        for (let rule of this.grammar) {
            // if(rule.Variable == initialVariable){
            // }

            for (let condition of rule.Conditions) {
                // [ { Content: '0', Type: Alphabet }, { Content: 'A', Type: Variable } ],

                for (let composition of condition) {
                    // { Content: '0', Type: Alphabet }
                    if (composition.Type == ConditionType.Alphabet) {

                        const alphabetIndex = this.getAndMapAlphabetPosition(composition.Content);
                        console.log({
                            ct: composition.Content,
                            alphabetIndex
                        });
                    }

                    // { Content: 'A', Type: Variable }
                }
            }
        }
    }
}