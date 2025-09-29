
import { type LearningPath } from './types';

export const LEARNING_PATH: LearningPath[] = [
  {
    title: "Introduction to Aztec",
    level: "Beginner",
    subTopics: [
      { id: "what-is-aztec", title: "What is Aztec Network?" },
      { id: "why-privacy", title: "Why is Privacy on Ethereum Important?" },
      { id: "zk-rollups", title: "Core Concept: ZK-Rollups" },
    ],
  },
  {
    title: "Core Concepts",
    level: "Intermediate",
    subTopics: [
      { id: "noir-language", title: "Introduction to Noir Language" },
      { id: "aztec-architecture", title: "Aztec Network Architecture" },
      { id: "private-public-state", title: "Private vs Public State" },
      { id: "state-model", title: "The UTXO State Model" },
    ],
  },
  {
    title: "Development with Noir",
    level: "Advanced",
    subTopics: [
      { id: "setting-up", title: "Setting up Your Dev Environment" },
      { id: "first-contract", title: "Writing Your First Smart Contract" },
      { id: "testing-contracts", title: "Testing Noir Contracts" },
      { id: "deployment", title: "Deploying to Aztec Sandbox" },
    ],
  },
  {
    title: "Building a dApp",
    level: "Expert",
    subTopics: [
        { id: "dapp-structure", title: "Structuring a Private dApp" },
        { id: "connecting-frontend", title: "Connecting a Frontend (React)" },
        { id: "aztec-js", title: "Interacting with Contracts via Aztec.js" },
        { id: "private-messaging-dapp", title: "Example: Private Messaging dApp" },
    ]
  }
];
