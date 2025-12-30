// Simulation Web Worker for TOPSIS Recalculations
import { OptionItem } from "../types/decision";

interface TopsisInput {
  options: OptionItem[];
  weights: number[];
  criteria_types: string[];
}

interface RankedOption extends OptionItem {
  topsis_score: number;
}

self.onmessage = (e: MessageEvent<TopsisInput>) => {
  const { options, weights, criteria_types } = e.data;

  try {
    const results = calculateTopsis(options, weights, criteria_types);
    self.postMessage({ status: 'success', data: results });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown calculation error";
    self.postMessage({ status: 'error', message });
  }
};

function calculateTopsis(options: OptionItem[], weights: number[], types: string[]) {
  if (!options || options.length === 0) return { randed_options: [] };

  // 1. Extract and normalize matrix
  const matrix = options.map(opt => [
    opt.parameters.base_cost,
    opt.parameters.availability,
    opt.parameters.risk
  ]);

  const numCriteria = matrix[0].length;
  const numOptions = matrix.length;

  // 2. Vector Normalization
  const sqSums = new Array<number>(numCriteria).fill(0);
  for (let j = 0; j < numCriteria; j++) {
    for (let i = 0; i < numOptions; i++) {
      sqSums[j] += matrix[i][j] * matrix[i][j];
    }
  }

  const normMatrix = matrix.map(row => 
    row.map((val, j) => val / (Math.sqrt(sqSums[j]) || 1))
  );

  // 3. Weighted Normalization
  const weightedMatrix = normMatrix.map(row =>
    row.map((val, j) => val * weights[j])
  );

  // 4. Ideal Best and Worst
  const idealBest = new Array<number>(numCriteria).fill(0);
  const idealWorst = new Array<number>(numCriteria).fill(0);

  for (let j = 0; j < numCriteria; j++) {
    const col = weightedMatrix.map(row => row[j]);
    if (types[j] === 'max') {
      idealBest[j] = Math.max(...col);
      idealWorst[j] = Math.min(...col);
    } else {
      idealBest[j] = Math.min(...col);
      idealWorst[j] = Math.max(...col);
    }
  }

  // 5. Calculate Separations
  const results: RankedOption[] = options.map((opt, i) => {
    let sBest = 0;
    let sWorst = 0;
    for (let j = 0; j < numCriteria; j++) {
      sBest += Math.pow(weightedMatrix[i][j] - idealBest[j], 2);
      sWorst += Math.pow(weightedMatrix[i][j] - idealWorst[j], 2);
    }
    sBest = Math.sqrt(sBest);
    sWorst = Math.sqrt(sWorst);

    const score = sWorst / ((sBest + sWorst) || 1);
    return {
      ...opt,
      topsis_score: score
    };
  });

  // 6. Rank and Sort
  const ranked = results.sort((a, b) => b.topsis_score - a.topsis_score);

  return { ranked_options: ranked };
}
