import { AFD } from './afd';
import {
    SOURCE_CODE_TOKENS_SEPARATOR,
} from './consts';
import { IVariableMap } from './models/variable-map.model';


export class Analyzer {
    private finiteAutomatonDetermined: AFD;

    private errorState: string;

    private sourceCode: string;

    private objectsOutput: string[];

    constructor() {
        this.objectsOutput = [];
    }

    private getWords(): string[] {
        return this.sourceCode.split(SOURCE_CODE_TOKENS_SEPARATOR);
    }

    private getErrorState(): string {
        if (this.errorState) return this.errorState;

        return this.errorState = this.finiteAutomatonDetermined.generateErrorState();
    }

    private analyzeWord(word: string) {
        let variableState = this.finiteAutomatonDetermined.generateVariable();

        for (let indexLetter = 0, s = word.length; indexLetter < s; indexLetter++) {
            const letter = word[indexLetter];

            // Obtem último estado (começa com S)
            const indexLetterInState = this.finiteAutomatonDetermined.getAlphabetIndexByLetter(letter);

            // Buscar index do alfabeto
            const indexVariableInState = this.finiteAutomatonDetermined.getVariableIndexByLetter(variableState);

            // Verificar qual estado resultou
            const nextVariableState = this.finiteAutomatonDetermined.getStatePosition(indexVariableInState, indexLetterInState);
            variableState = nextVariableState ? nextVariableState.join() : null;

            // Quando chegar na última letra
            const isLastLetter = (s - 1) == indexLetter;
            if (isLastLetter) {
                // Verifica se é terminal
                const isTerminal = this.finiteAutomatonDetermined.isVariableTerminal(variableState);

                // Se não é, adiciona estado de erro
                if (variableState == null || !isTerminal)
                    variableState = this.getErrorState();

                // Adiciona no array de estados resultantes e segue
                this.objectsOutput.push(variableState);
            }
        }
    }

    getOutput(): string[] {
        return this.objectsOutput;
    }

    setAFD(adf: AFD): void {
        this.finiteAutomatonDetermined = adf;
    }

    setSourceCode(sourceCode: string): void {
        this.sourceCode = sourceCode;
    }

    analyzeSource(): void {
        const words = this.getWords();

        for (let word of words) {
            this.analyzeWord(word);
        }
    }
}