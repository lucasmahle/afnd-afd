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

    protected isVariableMapped(variable: string): boolean {
        return Object.keys(this.variablesMap).indexOf(variable) >= 0;
    }

    protected getAndMapVariablePosition(variable: string | string[], isTerminal: boolean = false): number {
        let composition: string[] = undefined;
        if (Array.isArray(variable)) {
            composition = variable;
            variable = `[${variable.sort().join('')}]`;
        } else {
            composition = [variable];
        }

        if (!this.isVariableMapped(variable)) {
            this.variablesMap[variable] = {
                Value: Object.keys(this.variablesMap).length,
                IsTerminal: isTerminal,
                Composition: composition
            };
        }

        return this.variablesMap[variable].Value;
    }

    protected isAlphabetMapped(alphabet: string): boolean {
        return Object.keys(this.alphabetMap).indexOf(alphabet) >= 0;
    }

    protected getAndMapAlphabetPosition(alphabet: string): number {
        const sanitizedAlphabet = this.sanitizeAlphabet(alphabet);
        if (!this.isAlphabetMapped(sanitizedAlphabet)) {
            this.alphabetMap[sanitizedAlphabet] = Object.keys(this.alphabetMap).length;
        }

        return this.alphabetMap[sanitizedAlphabet];
    }

    protected setStatePosition(variableIndex: number, alphabetIndex: number, value: string) {
        if (this.state[variableIndex] == undefined)
            this.state[variableIndex] = [];

        const coordinateValue = this.state[variableIndex][alphabetIndex] || [];

        if (coordinateValue.includes(value)) return;

        coordinateValue.push(value);

        this.state[variableIndex][alphabetIndex] = coordinateValue;
    }

    protected getVariabelByIndex(index: number): IVariableMap {
        for (let variable in this.variablesMap) {
            if (this.variablesMap[variable].Value == index) return this.variablesMap[variable];
        }

        return null;
    }

    setState(state: string[][][]): void {
        this.state = state;
    }

    getVariableState(variableIndex: number): string[][] {
        return this.state[variableIndex];
    }

    setAlphabet(alphabetMap: { [key: string]: number }): void {
        this.alphabetMap = alphabetMap;
    }

    getAlphabet(): { [key: string]: number } {
        return this.alphabetMap;
    }

    setVariables(variablesMap: { [key: string]: IVariableMap }): void {
        this.variablesMap = variablesMap;
    }

    getVariables(): { [key: string]: IVariableMap } {
        return this.variablesMap;
    }

    printTable() {
        let stateClone = JSON.parse(JSON.stringify(this.state));

        const varsKeys = Object.keys(this.variablesMap);
        const stateClone2: any[] = [['#', ...(Object.keys(this.alphabetMap).map(v => this.rawAlphabet(v)))]];
        for (let i in varsKeys) {
            const varColumn = varsKeys[i] + (this.variablesMap[varsKeys[i]].IsTerminal ? '*' : '');
            stateClone2.push([varColumn, ...((stateClone[i] || []).map(v => (v || [' ']).join(',')))]);
        }

        console.table(stateClone2);
    }
}