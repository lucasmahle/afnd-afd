import {
    ASCII_A_VALUE,
    ASCII_S_VALUE,
    ASCII_X_VALUE,
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

    protected isVariableMapped(variable: string): boolean {
        return Object.keys(this.variablesMap).indexOf(variable) >= 0;
    }

    private variableToString(variable: string | string[]) {
        let composition: string[] = undefined;
        if (Array.isArray(variable)) {
            composition = variable;
            variable = variable.length > 1 ? `[${variable.sort().join('')}]` : variable[0].toString();
        } else {
            composition = [variable];
        }

        return { composition, variable };
    }

    protected replaceAndMapVariablePosition(oldVariableComposition: string | string[], newVariableComposition: string | string[], isTerminal: boolean = false): number {
        const { composition: oldComposition, variable: oldVariable } = this.variableToString(oldVariableComposition);
        const { composition: newComposition, variable: newVariable } = this.variableToString(newVariableComposition);

        delete this.variablesMap[oldVariable];

        if (!this.isVariableMapped(newVariable)) {
            this.variablesMap[newVariable] = {
                Value: Object.keys(this.variablesMap).length,
                IsTerminal: isTerminal,
                Composition: newComposition
            };
        }

        for (let i in this.state) {
            for (let j in this.state[i]) {
                if (this.state[i][j].includes(oldVariable))
                    this.state[i][j] = [...(this.state[i][j].filter(s => s !== oldVariable)), newVariable];
            }
        }

        return this.variablesMap[newVariable].Value;
    }

    protected getAndMapVariablePosition(compositionVariable: string | string[], isTerminal: boolean = false): number {
        const { composition, variable } = this.variableToString(compositionVariable);

        if (!this.isVariableMapped(variable)) {
            this.variablesMap[variable] = {
                Value: Object.keys(this.variablesMap).length,
                IsTerminal: isTerminal,
                Composition: composition
            };
            this.state[this.variablesMap[variable].Value] = [];
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

    getStatePosition(indexVariableInState: number, indexLetterInState: number): string[] {
        if (!this.state[indexVariableInState])
            return null;

        if (!this.state[indexVariableInState][indexLetterInState])
            return null;

        return this.state[indexVariableInState][indexLetterInState];
    }

    generateErrorState(): string {
        return this.generateVariable(0, true);
    }

    generateVariable(variablesCount: number = -1, isErrorState: boolean = false): string {
        if (variablesCount < 0)
            return String.fromCharCode(ASCII_S_VALUE);

        if (isErrorState)
            return String.fromCharCode(ASCII_X_VALUE);

        let nextVariableASCIICode = ASCII_A_VALUE + variablesCount;
        if (nextVariableASCIICode >= ASCII_S_VALUE)
            nextVariableASCIICode++;

        if (nextVariableASCIICode >= ASCII_X_VALUE)
            nextVariableASCIICode++;

        let prefix = '';
        if (nextVariableASCIICode > ASCII_Z_VALUE) {
            const decreaseTimes = Math.floor(nextVariableASCIICode / ASCII_Z_VALUE) - 1;
            prefix = this.generateVariable(decreaseTimes);
            nextVariableASCIICode = nextVariableASCIICode - (ASCII_Z_VALUE - ASCII_A_VALUE) - 1;
        }

        return prefix + String.fromCharCode(nextVariableASCIICode);
    }

    getAlphabetIndexByLetter(letter: string): number {
        const sanitizedLetter = this.sanitizeAlphabet(letter);

        if (!(sanitizedLetter in this.alphabetMap)) return null;

        return this.alphabetMap[sanitizedLetter];
    }

    getVariableIndexByLetter(variable: string): number {
        if (!this.isVariableMapped(variable))
            return null;

        return this.variablesMap[variable].Value;
    }

    isVariableTerminal(variable: string | string[]): boolean {
        if (Array.isArray(variable))
            return variable.some(variable => this.isVariableTerminal(variable));

        if (!this.isVariableMapped(variable))
            return false;

        return this.variablesMap[variable].IsTerminal;
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

    getStateVariableLength(): number {
        return Object.keys(this.variablesMap).length;
    }

    getStateAlphabetLength(): number {
        return Object.keys(this.alphabetMap).length;
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