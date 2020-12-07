import {
    ASCII_A_VALUE,
    ASCII_S_VALUE,
    ASCII_Z_VALUE,
} from './consts';
import { IVariableMap } from './models/variable-map.model';


export class FiniteAutomaton {
    protected state: string[][][] = [[]];

    protected alphabetMap: { [key: string]: number } = {};

    protected variablesMap: { [key: string]: IVariableMap } = {};


    protected sanitizeAlphabet(alphabet: string): string {
        return `_${alphabet}`;
    }

    protected rawAlphabet(alphabet: string): string {
        if (alphabet.charAt(0) == '_')
            return alphabet.substr(1);

        return alphabet;
    }

    protected generateVariable(variablesCount: number = -1): string {
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

    setState(state: string[][][]): void {
        this.state = state;
    }

    setAlphabet(alphabetMap: { [key: string]: number }): void {
        this.alphabetMap = alphabetMap;
    }

    setVariables(variablesMap: { [key: string]: IVariableMap }): void {
        this.variablesMap = variablesMap;
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
}