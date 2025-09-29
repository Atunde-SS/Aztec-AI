import { knowledgeBase } from './geminiService';
import { LEARNING_PATH } from '../constants';
import { type SearchResult } from '../types';

// A comprehensive and accurate mapping from knowledge base section titles 
// to their most relevant topic ID. This ensures search results link to the correct content.
// It includes mappings for full titles, "clean" titles (without parenthetical explanations),
// and specific subsection titles for granular navigation.
const sectionToTopicMapping: { [key: string]: string } = {
  // ===================================================================
  // ## Section 1: High-Level Overview
  // ===================================================================
  "1. High-Level Overview (zk Privacy Fundamentals and Aztec Ecosystem)": "what-is-aztec",
  "1. High-Level Overview": "what-is-aztec",
  // Granular topics within Section 1
  "Key Concepts Covered": "zk-rollups",

  // ===================================================================
  // ## Section 2: Core Libraries
  // ===================================================================
  "2. Core Libraries (zk Prover and Language Tools)": "noir-language",
  "2. Core Libraries": "noir-language",
  // Granular topics within Section 2
  "2.1 Barretenberg (zk Prover Backend)": "aztec-architecture",
  "2.1 Barretenberg": "aztec-architecture",
  "2.2 Aztec-nr (Noir Framework for Contracts)": "noir-language",
  "2.2 Aztec-nr": "noir-language",

  // ===================================================================
  // ## Section 3: Applications
  // ===================================================================
  "3. Applications (Building and Testing zk Contracts)": "first-contract",
  "3. Applications": "first-contract",
  // Granular topics within Section 3
  "3.1 Aztec Starter (Hello World Contract)": "first-contract",
  "3.1 Aztec Starter": "first-contract",
  "3.2 Noir Starter and Examples": "dapp-structure",

  // ===================================================================
  // ## Section 3.3: Advanced Development & Debugging
  // ===================================================================
  "3.3 Advanced Development & Debugging": "deployment",
  // Granular topics within Section 3.3
  "Common Developer Challenges": "private-public-state",
  "Advanced Deployment": "deployment",
  "Debugging Techniques": "testing-contracts",

  // ===================================================================
  // ## Section 4: Community and Advanced Resources
  // ===================================================================
  "4. Community and Advanced Resources (Engagement & Specs)": "aztec-js",
  "4. Community and Advanced Resources": "aztec-js",
};


const allSubTopics = LEARNING_PATH.flatMap(p => p.subTopics);

export const searchKnowledgeBase = (query: string): SearchResult[] => {
  if (!query.trim()) {
    return [];
  }

  const results: SearchResult[] = [];
  const lowerCaseQuery = query.toLowerCase();
  
  // Split the knowledge base into major sections starting with '##'
  const sections = knowledgeBase.split(/(?=^##\s)/m);

  for (const section of sections) {
    const lines = section.split('\n');
    const titleLine = lines.find(line => line.startsWith('## '));
    if (!titleLine) continue;

    const sectionTitle = titleLine.substring(3).trim();
    // Use regex to extract the main title part before parenthesis
    const match = sectionTitle.match(/^(.*?)\s*\(/);
    const cleanSectionTitle = match ? match[1].trim() : sectionTitle;
    
    // Split the section into subsections if they exist
    const subsections = section.split(/(?=^###\s)/m);
    
    for (const subsection of subsections) {
      const subLines = subsection.split('\n');
      const subTitleLine = subLines.find(line => line.startsWith('### '));
      const currentTitle = subTitleLine ? subTitleLine.substring(4).trim() : sectionTitle;
      const cleanCurrentTitle = subTitleLine ? currentTitle.replace(/ \(.*/, '') : cleanSectionTitle;
      
      const content = subsection.toLowerCase();
      
      if (content.includes(lowerCaseQuery)) {
        // Prioritize the most specific mapping first (subsection), then fall back.
        const topicId = sectionToTopicMapping[currentTitle] || sectionToTopicMapping[cleanCurrentTitle] || sectionToTopicMapping[sectionTitle] || sectionToTopicMapping[cleanSectionTitle] || allSubTopics[0].id;
        const topic = allSubTopics.find(t => t.id === topicId);
        
        // Find the first occurrence to create a snippet
        const index = content.indexOf(lowerCaseQuery);
        const start = Math.max(0, index - 50);
        const end = Math.min(content.length, index + lowerCaseQuery.length + 50);
        
        let snippet = subsection.substring(start, end);

        // Highlight the matched query
        const regex = new RegExp(query, 'gi');
        snippet = snippet.replace(regex, (match) => `<mark class="bg-lime-500/50 text-white not-italic font-semibold">${match}</mark>`);


        results.push({
          topicId: topic?.id || allSubTopics[0].id,
          topicTitle: topic?.title || allSubTopics[0].title,
          sectionTitle: currentTitle.replace(/^\d+(\.\d+)?\s*/, ''), // Remove leading numbers for display
          snippet: `...${snippet}...`,
        });
      }
    }
  }

  // Deduplicate results based on snippet and section title
  const uniqueResults = Array.from(new Map(results.map(item => [`${item.sectionTitle}:${item.snippet}`, item])).values());
  return uniqueResults;
};