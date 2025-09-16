import type {ThingsInterface} from "../types/Things";
import type {Genome, Population} from "../types/data_structure";

// -- Generate Data_structure
function generateBinaryGenome(length: number): Genome<number>{
    let genome: Genome<number> = [];
    for (let i = 0; i < length; i++)
        (Math.random() < 0.5 ) ? genome.push(1): genome.push(0);
    return genome;
}

function generateListedGenome<ElementType>(length: number, list: ElementType[]): Genome<ElementType>{
    let genome: Genome<ElementType> = [];
    for (let i = 0; i < length; i++){
        let index: number = Math.floor(Math.random() * list.length);

        if (typeof list[index] !== "undefined")
            genome.push(list[index]);
    }
    return genome;
}

// -- Generate Population
function generateBinaryPopulation(size: number, genomeLength: number): Population<number>{
    let population: number[][] = [];
    for (let i = 0; i < size; i++)
        population.push(generateBinaryGenome(genomeLength));
    return population;
}

function generateListedPopulations<ElementType>(size: number, genomeLength: number, acceptableGeneList: ElementType[]): Population<ElementType>{
    let population: Genome<ElementType>[] = [];
    for (let i = 0; i < size; i++)
        population.push(generateListedGenome<ElementType>(genomeLength, acceptableGeneList));
    return population;
}

function pickOne(weights: number[]): number{
    let index = 0;
    let r = Math.random();

    while (r > 0){
        r = r - weights[index]!;
        index++;
    }
    index--;
    return index;
}

// -- Selection
function rouletteWheelSelection<ElementType>(population: Population<ElementType>, fitnessList: number[]): [Genome<ElementType>, Genome<ElementType>]{

    let probability: number[] = [];
    let fitnessTotal = 0;
    for (let i = 0; i < fitnessList.length; i++)
        fitnessTotal += fitnessList[i]!;
    for (let i = 0; i < fitnessList.length; i++)
        probability.push(fitnessList[i]!/fitnessTotal);

    let parentA: Genome<ElementType> = population[pickOne(probability)]!;
    let parentB: Genome<ElementType> = population[pickOne(probability)]!;

    return [parentA, parentB];
}

// -- Crossover
function singlePointCrossover<ElementType>(a: Genome<ElementType>, b: Genome<ElementType>): [Genome<ElementType>, Genome<ElementType>]{
    console.assert(a.length === b.length, "%O", "Both genome must have same length");

    if (a.length < 2)
        return [a, b];

    let point = Math.floor(Math.random() * a.length);
    let newParentA: Genome<ElementType> = [];
    let newParentB: Genome<ElementType> = [];

    for (let i = 0; i < point; ++i){
        newParentA.push(a[i]!);
        newParentB.push(b[i]!);
    }
    for (let i = point; i < a.length; ++i){
        newParentA.push(b[i]!);
        newParentB.push(a[i]!);
    }

    return [newParentA, newParentB];
}

// -- Mutation
function bitFlipMutation(genome: Genome<number>, probability: number): Genome<number>{
    let index: number = Math.floor(Math.random() * genome.length);
    if (Math.random() < probability)
        genome[index] = Number(genome[index]) ^ 1;
    return genome;
}

// --Fitness
function fitness<ElementType>(genome: Genome<ElementType>, things: ThingsInterface[], weight_limit: number): number{
    // if (genome.length !== things.length)
    //     console.error("Genome and Things must have the same length.");

    console.assert(genome.length === things.length, "%O", "Genome and Things must have the same length.");

    let weight = 0;
    let value = 0;

    for (let i = 0; i < genome.length; i++){
        if (genome[i] === 1){
            const thing = things[i];
            if (thing){
                weight += thing.weight;
                value += thing.value;

                if (weight > weight_limit)
                    return 0;
            }
        }
    }

    return value;
}


let things:  ThingsInterface[] = [
    {name: "Laptop", value: 500, weight: 2200},
    {name: "Headphones", value: 150, weight: 160},
    {name: "Coffee Mug", value: 60, weight: 350},
    {name: "Notepad", value: 40, weight: 333},
    {name: "Water Bottle", value: 30, weight: 192},
    {name: "Phone", value: 500, weight: 200},
    {name: "Baseball Cap", value: 100, weight: 70},
    {name: "Mint", value: 5, weight: 25},
    // {name: "Tissues", value: 15, weight: 80},
    {name: "Socks", value: 10, weight: 38},
    // {name: "Book", value: 300, weight: 1000},
    // {name: "Charger", value: 25, weight: 150},
]



// console.log(things);
// console.log(generateBinaryPopulation(5, 4))
// console.log(generateListedPopulations(5, 5, [1,2,3,4,5,6,7,8,9,0]))
// console.log(generateListedPopulations(5, 5, ["d", "dsf","ser","tyu"]))
// console.log(generateListedPopulations(5, 5, things))

// Initiate Population

let fitnessLimit = 1310;
let generationLimit = 100;

let population: Population<number> = generateBinaryPopulation(10,things.length);

for (let generation = 0; generation < generationLimit; generation++){
    let fitnessList: number[] = [];
    for (let i = 0; i < population.length; i++){
        let singleGenome = population[i];
        if (singleGenome)
            fitnessList.push(fitness<number>(singleGenome, things, 3000));
    }

    // Sort the population and fitness
    for (let i = 0; i < population.length; i++){
        for (let j = i+1; j < population.length; j++){
            if (fitnessList[i]! < fitnessList[j]!){
                let tempFitness = fitnessList[j]!;
                fitnessList[j] = fitnessList[i]!;
                fitnessList[i] = tempFitness;

                let tempGenome = population[j]!;
                population[j] = population[i]!;
                population[i] = tempGenome;
            }
        }
    }

    if (fitnessList[0]! >= fitnessLimit)
        break;

    let nextGeneration: Population<number> = [];
    nextGeneration.push(population[0]!);
    nextGeneration.push(population[1]!);

    for (let i = 0; i < (population.length/2) - 1; i++){
        let [parentA, parentB] = rouletteWheelSelection(population, fitnessList);
        let [offspringA, offspringB] = singlePointCrossover(parentA, parentB);
        let [mutatedA, mutatedB] = [bitFlipMutation(offspringA, 0.5), bitFlipMutation(offspringB, 0.5)];
        nextGeneration.push(mutatedA, mutatedB);
    }

    population = nextGeneration;
}
let fitnessList: number[] = [];
for (let i = 0; i < population.length; i++){
    let singleGenome = population[i];
    if (singleGenome)
        fitnessList.push(fitness<number>(singleGenome, things, 3000));
}

for (let i = 0; i < population.length; i++){
    for (let j = i+1; j < population.length; j++){
        if (fitnessList[i]! < fitnessList[j]!){
            let tempFitness = fitnessList[j]!;
            fitnessList[j] = fitnessList[i]!;
            fitnessList[i] = tempFitness;

            let tempGenome = population[j]!;
            population[j] = population[i]!;
            population[i] = tempGenome;
        }
    }
}

let knapsack: ThingsInterface[] = [];
let value = 0;
for (let i = 0; i < things.length; i++){
    if (population[0]![i] == 1)
        knapsack.push(things[i]!), value += things[i]!.value;
}


console.log(knapsack, value);
// console.log(fitnessList);