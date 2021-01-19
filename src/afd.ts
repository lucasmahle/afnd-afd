import { FiniteAutomaton } from './finite-automaton';
import { IVariableMap } from './models/variable-map.model';


export class AFD extends FiniteAutomaton {
    private finiteAutomatonNotDetermined: FiniteAutomaton;
    constructor() {
        super();

        this.finiteAutomatonNotDetermined = new FiniteAutomaton();
    }

    setState(stateNotDetermined: string[][][]): void {
        const value: string[][][] = JSON.parse(JSON.stringify(stateNotDetermined));

        this.finiteAutomatonNotDetermined.setState(value);
    }

    setAlphabet(alphabetMap: { [key: string]: number }): void {
        const value = JSON.parse(JSON.stringify(alphabetMap));
        this.finiteAutomatonNotDetermined.setAlphabet(value);
        this.alphabetMap = value;
    }

    setVariables(variablesMap: { [key: string]: IVariableMap }): void {
        const value = JSON.parse(JSON.stringify(variablesMap));
        const inicialVariable = this.generateVariable();

        this.finiteAutomatonNotDetermined.setVariables(value);
        this.variablesMap[inicialVariable] = value[inicialVariable];
    }

    convertToDetermined(): void {
        const mappedVariables = {};
        const NDvariables = this.finiteAutomatonNotDetermined.getVariables();
        let amountNewVariable = 1;

        for (let indexVariable = 0; indexVariable < amountNewVariable; indexVariable++) {
            //console.log(`indexVariable: ${indexVariable}`);

            const newStateVariable = this.getVariabelByIndex(indexVariable);

            const mapaInteracaoComposicao = {};
            for (let variableComposition of newStateVariable.Composition) {
                // this.printTable();
                //console.log(`variableComposition: ${variableComposition}`);
                const statesFromNDVariable = this.finiteAutomatonNotDetermined.getVariableState(NDvariables[variableComposition].Value);

                for (let NDvariableLetterIndex in statesFromNDVariable) {
                    let NDvariableLetter = statesFromNDVariable[NDvariableLetterIndex];
                    if (NDvariableLetter === null) continue;

                    let nextVariableState = NDvariableLetter.length > 0 ? NDvariableLetter[0] : '';

                    if (NDvariableLetter.length > 1) {
                        //console.log('Mais de um estado para a letra por esse estado');

                        // Agrupa variáveis e cria o estado novo [concatenações]; Se um deles for terminal, adicionar flag de final
                        nextVariableState = `[${NDvariableLetter.sort().join('')}]`;

                        // Adiciona no mapeamento de estados novos
                        // TODO: Verificar se é terminal
                        this.getAndMapVariablePosition(NDvariableLetter, false);
                        this.setStatePosition(indexVariable, parseInt(NDvariableLetterIndex), nextVariableState);
                        amountNewVariable++;
                        NDvariableLetter.map(v => mappedVariables[v] = nextVariableState);
                    } else if (mapaInteracaoComposicao[NDvariableLetterIndex]) {
                        //console.log('Já existe um estado dessa composição para essa letra');

                        const composicaoEstadoASerSubstituido = mapaInteracaoComposicao[NDvariableLetterIndex];
                        const composicaoNovoEstado = [...mapaInteracaoComposicao[NDvariableLetterIndex], nextVariableState];

                        // TODO: Verificar se é terminal
                        this.replaceAndMapVariablePosition(composicaoEstadoASerSubstituido, composicaoNovoEstado, false);

                        mapaInteracaoComposicao[NDvariableLetterIndex] = composicaoNovoEstado;

                    } else if (!mappedVariables[nextVariableState]) {
                        //console.log('Apenas um estado para essa letra nesse estado não mapeado');
                        //console.log('NDvariableLetterIndex', NDvariableLetterIndex);

                        mapaInteracaoComposicao[NDvariableLetterIndex] = mapaInteracaoComposicao[NDvariableLetterIndex] || [];
                        mapaInteracaoComposicao[NDvariableLetterIndex].push(nextVariableState);
                        // if (mapaInteracaoComposicao[NDvariableLetterIndex].length > 0) {
                        //     const aaaa = mapaInteracaoComposicao[NDvariableLetterIndex];
                        //     const vvvv = aaaa.length == 1 ? aaaa : `[${aaaa.join('')}]`;
                        ////     console.log('mappedVariables', vvvv, mappedVariables);
                        ////     console.log('this.variablesMap[vvvv]', this.variablesMap[vvvv]);
                        //     mapaInteracaoComposicao[NDvariableLetterIndex].push(nextVariableState);
                        //     delete this.variablesMap[vvvv];
                        //     nextVariableState = mapaInteracaoComposicao[NDvariableLetterIndex].length == 1 ? mapaInteracaoComposicao[NDvariableLetterIndex] : `[${mapaInteracaoComposicao[NDvariableLetterIndex].join('')}]`;
                        // } else {
                        //     mapaInteracaoComposicao[NDvariableLetterIndex].push(nextVariableState);
                        // }

                        // TODO: Verificar se é terminal
                        this.getAndMapVariablePosition(nextVariableState, false);
                        this.setStatePosition(indexVariable, parseInt(NDvariableLetterIndex), nextVariableState);
                        amountNewVariable++;

                        mappedVariables[nextVariableState] = NDvariableLetter;
                    } else {
                        //console.log('Apenas um estado para essa letra nesse estado já mapeado');
                        this.setStatePosition(indexVariable, parseInt(NDvariableLetterIndex), nextVariableState);
                    }
                    //console.log(NDvariableLetter);
                    //console.log(mappedVariables);
                    //console.log(mapaInteracaoComposicao);
                }
            }
        }

        return;
        // let simpleVariablesCount = 0;

        const initialVariable = this.generateVariable();
        const NDitaratedVariableValue = NDvariables[initialVariable];

        // Buscar todos destinos da variável iterada
        const NDitaratedVariableAlphabet = this.finiteAutomatonNotDetermined.getVariableState(NDitaratedVariableValue.Value);

        for (let NDvariableLetterIndex in NDitaratedVariableAlphabet) {
            let NDvariableLetter = NDitaratedVariableAlphabet[NDvariableLetterIndex];
            if (NDvariableLetter === null) continue;

            let nextVariableState = '';

            if (NDvariableLetter.length > 1) {
                // Agrupa variáveis e cria o estado novo [concatenações]; Se um deles for terminal, adicionar flag de final
                nextVariableState = `[${NDvariableLetter.sort().join('')}]`;

                // Adiciona no mapeamento de estados novos
                // TODO: Verificar se é terminal
                const variableIndex = this.getAndMapVariablePosition(nextVariableState, false);

                // Busca todos mapeamentos de cada variável que foi agrupada
                for (let variable of NDvariableLetter) {
                    // TODO: renomear
                    const res = this.finiteAutomatonNotDetermined.getVariableState(NDvariables[variable].Value);

                    for (let indexReferenceTo in res) {
                        if (res[indexReferenceTo] === null) continue;

                        this.setStatePosition(NDitaratedVariableValue.Value, parseInt(NDvariableLetterIndex), nextVariableState);
                    }
                }


            } else {
                nextVariableState = NDvariableLetter[0];
                // TODO: Verificar se é terminal
                this.getAndMapVariablePosition(nextVariableState, false);

                // if (!(NDvariableLetter[0] in mappedVariables)) {
                //     nextVariableState = this.generateVariable(simpleVariablesCount);
                //     simpleVariablesCount++;
                //     // TODO: Verificar se é terminal
                //     const variableIndex = this.getAndMapVariablePosition(nextVariableState, false);
                // }
            }
        }
    }

    // convertToDetermined(): void {
    //     const mappedVariables = {};
    //     const mapeamentoEstadosAgrupados: { [key: string]: string[] } = {};
    //     // let simpleVariablesCount = 0;

    //     const initialVariable = this.generateVariable();
    //     const NDvariables = this.finiteAutomatonNotDetermined.getVariables();
    //     const NDitaratedVariableValue = NDvariables[initialVariable];

    //     // Buscar todos destinos da variável iterada
    //     const NDitaratedVariableAlphabet = this.finiteAutomatonNotDetermined.getVariableState(NDitaratedVariableValue.Value);

    //     for (let NDvariableLetterIndex in NDitaratedVariableAlphabet) {
    //         let NDvariableLetter = NDitaratedVariableAlphabet[NDvariableLetterIndex];
    //         if (NDvariableLetter === null) continue;

    //         let nextVariableState = '';

    //         if (NDvariableLetter.length > 1) {
    //             // Agrupa variáveis e cria o estado novo [concatenações]; Se um deles for terminal, adicionar flag de final
    //             nextVariableState = `[${NDvariableLetter.sort().join('')}]`;

    //             // Adiciona no mapeamento de estados novos
    //             // TODO: Verificar se é terminal
    //             const variableIndex = this.getAndMapVariablePosition(nextVariableState, false);

    //             // Busca todos mapeamentos de cada variável que foi agrupada
    //             for (let variable of NDvariableLetter) {
    //                 // TODO: renomear
    //                 const res = this.finiteAutomatonNotDetermined.getVariableState(NDvariables[variable].Value);

    //                 for (let indexReferenceTo in res) {
    //                     if (res[indexReferenceTo] === null) continue;

    //                     this.setStatePosition(NDitaratedVariableValue.Value, parseInt(NDvariableLetterIndex), nextVariableState);
    //                 }
    //             }

    //             NDvariableLetter.map(v => mappedVariables[v] = nextVariableState);

    //             mapeamentoEstadosAgrupados[nextVariableState] = NDvariableLetter;
    //             console.log(mapeamentoEstadosAgrupados);
    //         } else {
    //             nextVariableState = NDvariableLetter[0];
    //             // TODO: Verificar se é terminal
    //             this.getAndMapVariablePosition(nextVariableState, false);

    //             // if (!(NDvariableLetter[0] in mappedVariables)) {
    //             //     nextVariableState = this.generateVariable(simpleVariablesCount);
    //             //     simpleVariablesCount++;
    //             //     // TODO: Verificar se é terminal
    //             //     const variableIndex = this.getAndMapVariablePosition(nextVariableState, false);
    //             // }
    //         }
    //     }
    // }
}