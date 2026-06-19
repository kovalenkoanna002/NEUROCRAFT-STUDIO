import NetworkVisualization, { NeuralNetwork } from "./NetworkVisualization";
import { GanSpec } from "../../auth/projects";
import styles from "./Architecture.module.scss";

interface ArchitectureProps {
  network?: NeuralNetwork;
  gan?: GanSpec;
}

const Architecture: React.FC<ArchitectureProps> = ({ network, gan }) => {

  const defaultNetworkData: NeuralNetwork = {
    layers: [
      { type: "input", neuronCount: 4 },
      { type: "dense", neuronCount: 16, activationFunction: "relu" },
      { type: "dense", neuronCount: 8, activationFunction: "relu" },
      { type: "output", neuronCount: 3, activationFunction: "softmax" },
    ],
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.neuralnetwork__visualization}>
          <h1 className={styles.title}>Архитектура вашей нейронной сети</h1>
          <div className={styles.architecture}>
            <NetworkVisualization
              network={network ?? defaultNetworkData}
              gan={gan}
            />
          </div>
        </div>
      </div>
    </>
  );
};
export default Architecture;
