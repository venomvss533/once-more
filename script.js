class ComplexityAnalyzer {
    constructor() {
        this.initializeEventListeners();
        this.examples = this.getExamples();
    }

    initializeEventListeners() {
        document.getElementById('calculateBtn').addEventListener('click', () => this.calculateComplexity());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearInput());
        document.getElementById('exampleBtn').addEventListener('click', () => this.loadExample());
        document.getElementById('copyResult').addEventListener('click', () => this.copyResults());
        
        // Enter key to calculate (with Ctrl/Cmd)
        document.getElementById('inputCode').addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                this.calculateComplexity();
            }
        });
    }

    getExamples() {
        return {
            python: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,

            javascript: `function fibonacci(n) {
    if (n <= 1) return n;
    
    let prev = 0, curr = 1;
    for (let i = 2; i <= n; i++) {
        let next = prev + curr;
        prev = curr;
        curr = next;
    }
    return curr;
}`,

            pseudocode: `for i = 0 to n-1:
    for j = 0 to n-1:
        print(i, j)
        
for k = 0 to n-1:
    print(k)`
        };
    }

    async calculateComplexity() {
        const code = document.getElementById('inputCode').value.trim();
        const language = document.getElementById('languageSelect').value;
        
        if (!code) {
            this.showError('Please enter some code to analyze.');
            return;
        }

        this.setLoadingState(true);
        
        // Simulate analysis (in a real app, this would be more sophisticated)
        await this.simulateAnalysis();
        
        const analysis = this.analyzeCode(code, language);
        this.displayResults(analysis);
        this.setLoadingState(false);
    }

    analyzeCode(code, language) {
        // Basic pattern matching for complexity analysis
        // In a real implementation, this would use proper parsing
        const lines = code.split('\n');
        let maxNestedLoops = 0;
        let currentNesting = 0;
        let hasRecursion = false;
        let dataStructures = new Set();
        
        // Simple pattern detection
        lines.forEach(line => {
            const trimmed = line.trim().toLowerCase();
            
            // Detect loops
            if (trimmed.match(/(for|while|do\s*\{)/)) {
                currentNesting++;
                maxNestedLoops = Math.max(maxNestedLoops, currentNesting);
            } else if (trimmed.match(/\}/) || trimmed.match(/end/)) {
                currentNesting = Math.max(0, currentNesting - 1);
            }
            
            // Detect recursion
            if (trimmed.match(/function|def|func/) && trimmed.match(/\(.*\)/)) {
                const functionName = trimmed.match(/(function|def|func)\s+(\w+)/)?.[2];
                if (functionName && code.includes(functionName + '(')) {
                    hasRecursion = true;
                }
            }
            
            // Detect data structures
            if (trimmed.match(/array|list|\[\]/)) dataStructures.add('array');
            if (trimmed.match(/hash|map|dict|object/)) dataStructures.add('hash');
            if (trimmed.match(/tree|node|graph/)) dataStructures.add('tree');
        });

        return this.determineComplexity(maxNestedLoops, hasRecursion, dataStructures);
    }

    determineComplexity(nestedLoops, hasRecursion, dataStructures) {
        let timeComplexity = 'O(1)';
        let spaceComplexity = 'O(1)';
        let timeExplanation = 'Constant time - no loops or recursion detected.';
        let spaceExplanation = 'Constant space - no significant data structures detected.';

        // Time complexity determination
        if (hasRecursion) {
            timeComplexity = 'O(2^n)';
            timeExplanation = 'Exponential time - recursive calls detected (may vary based on implementation).';
        } else if (nestedLoops >= 3) {
            timeComplexity = 'O(n³)';
            timeExplanation = `Cubic time - ${nestedLoops} nested loops detected.`;
        } else if (nestedLoops === 2) {
            timeComplexity = 'O(n²)';
            timeExplanation = 'Quadratic time - 2 nested loops detected.';
        } else if (nestedLoops === 1) {
            timeComplexity = 'O(n)';
            timeExplanation = 'Linear time - single loop detected.';
        }

        // Space complexity determination
        if (dataStructures.has('tree') || dataStructures.has('graph')) {
            spaceComplexity = 'O(n)';
            spaceExplanation = 'Linear space - tree/graph data structure detected.';
        } else if (dataStructures.has('hash')) {
            spaceComplexity = 'O(n)';
            spaceExplanation = 'Linear space - hash map/dictionary detected.';
        } else if (dataStructures.has('array')) {
            spaceComplexity = 'O(n)';
            spaceExplanation = 'Linear space - array/list detected.';
        }

        return {
            timeComplexity,
            spaceComplexity,
            timeExplanation,
            spaceExplanation,
            detailed: this.generateDetailedAnalysis(nestedLoops, hasRecursion, dataStructures)
        };
    }

    generateDetailedAnalysis(nestedLoops, hasRecursion, dataStructures) {
        let analysis = 'Analysis Details:\n\n';
        
        if (nestedLoops > 0) {
            analysis += `• Found ${nestedLoops} level${nestedLoops > 1 ? 's' : ''} of nested loops\n`;
        }
        
        if (hasRecursion) {
            analysis += '• Recursive function calls detected\n';
        }
        
        if (dataStructures.size > 0) {
            analysis += `• Data structures used: ${Array.from(dataStructures).join(', ')}\n`;
        }
        
        analysis += '\nNote: This is an automated analysis. For complex algorithms, manual review is recommended.';
        
        return analysis;
    }

    displayResults(analysis) {
        const resultSection = document.getElementById('result');
        resultSection.classList.remove('hidden');

        document.getElementById('timeComplexity').textContent = analysis.timeComplexity;
        document.getElementById('spaceComplexity').textContent = analysis.spaceComplexity;
        document.getElementById('timeExplanation').textContent = analysis.timeExplanation;
        document.getElementById('spaceExplanation').textContent = analysis.spaceExplanation;
        document.getElementById('detailedAnalysis').textContent = analysis.detailed;

        // Add appropriate styling based on complexity
        this.styleComplexityCards(analysis);
    }

    styleComplexityCards(analysis) {
        const timeCard = document.querySelector('#timeComplexity').closest('.complexity-card');
        const spaceCard = document.querySelector('#spaceComplexity').closest('.complexity-card');

        // Reset classes
        [timeCard, spaceCard].forEach(card => {
            card.className = 'complexity-card';
        });

        // Style based on complexity
        const timeComplexity = analysis.timeComplexity;
        if (timeComplexity.includes('O(2^n)') || timeComplexity.includes('O(n!)')) {
            timeCard.classList.add('error');
        } else if (timeComplexity.includes('O(n³)') || timeComplexity.includes('O(n²)')) {
            timeCard.classList.add('warning');
        } else {
            timeCard.classList.add('success');
        }

        spaceCard.classList.add('success');
    }

    setLoadingState(loading) {
        const button = document.getElementById('calculateBtn');
        const spinner = button.querySelector('.spinner');
        const buttonText = button.querySelector('.btn-text');
        
        if (loading) {
            button.disabled = true;
            spinner.classList.remove('hidden');
            buttonText.textContent = 'Analyzing...';
            document.body.classList.add('loading');
        } else {
            button.disabled = false;
            spinner.classList.add('hidden');
            buttonText.textContent = 'Analyze Complexity';
            document.body.classList.remove('loading');
        }
    }

    clearInput() {
        document.getElementById('inputCode').value = '';
        document.getElementById('result').classList.add('hidden');
    }

    loadExample() {
        const language = document.getElementById('languageSelect').value;
        document.getElementById('inputCode').value = this.examples[language] || this.examples.pseudocode;
    }

    async copyResults() {
        const timeComplexity = document.getElementById('timeComplexity').textContent;
        const spaceComplexity = document.getElementById('spaceComplexity').textContent;
        const detailed = document.getElementById('detailedAnalysis').textContent;
        
        const textToCopy = `Time Complexity: ${timeComplexity}\nSpace Complexity: ${spaceComplexity}\n\n${detailed}`;
        
        try {
            await navigator.clipboard.writeText(textToCopy);
            this.showTemporaryMessage('Results copied to clipboard!', 'success');
        } catch (err) {
            this.showTemporaryMessage('Failed to copy results', 'error');
        }
    }

    showTemporaryMessage(message, type) {
        const messageEl = document.createElement('div');
        messageEl.textContent = message;
        messageEl.className = `message message-${type}`;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            border-radius: 6px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.remove();
        }, 3000);
    }

    showError(message) {
        this.showTemporaryMessage(message, 'error');
    }

    async simulateAnalysis() {
        // Simulate processing time
        return new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ComplexityAnalyzer();
});

// Add CSS for message animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);
