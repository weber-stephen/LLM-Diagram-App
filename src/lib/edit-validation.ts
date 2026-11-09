export interface EditCommandValidation {
  isValid: boolean;
  error?: string;
  suggestions?: string[];
}

export function validateEditCommand(command: string): EditCommandValidation {
  if (!command || command.trim().length === 0) {
    return {
      isValid: false,
      error: "Edit command cannot be empty"
    };
  }

  const trimmedCommand = command.trim().toLowerCase();

  // Check for common invalid patterns
  if (trimmedCommand.length < 3) {
    return {
      isValid: false,
      error: "Edit command is too short",
      suggestions: ["Try being more specific about what you want to change"]
    };
  }

  // Check for potentially destructive commands
  const destructiveKeywords = ['delete', 'remove', 'clear', 'destroy', 'wipe'];
  const hasDestructiveKeyword = destructiveKeywords.some(keyword => 
    trimmedCommand.includes(keyword)
  );

  if (hasDestructiveKeyword) {
    return {
      isValid: true,
      error: undefined,
      suggestions: [
        "This command will remove parts of your diagram",
        "Make sure this is what you want to do",
        "You can always revert using the snapshot history"
      ]
    };
  }

  // Check for common edit patterns
  const validPatterns = [
    'add', 'insert', 'create', 'new',
    'replace', 'change', 'update', 'modify',
    'connect', 'link', 'join',
    'move', 'reorder', 'rearrange',
    'rename', 'label'
  ];

  const hasValidPattern = validPatterns.some(pattern => 
    trimmedCommand.includes(pattern)
  );

  if (!hasValidPattern) {
    return {
      isValid: true,
      error: undefined,
      suggestions: [
        "Try starting with: 'Add', 'Replace', 'Remove', 'Connect', or 'Move'",
        "Be specific about what you want to change",
        "Example: 'Add a database between the API and the frontend'"
      ]
    };
  }

  return {
    isValid: true
  };
}

export function getEditCommandSuggestions(diagramType: string): string[] {
  const baseSuggestions = [
    "Add a new component",
    "Replace [component] with [new component]",
    "Connect [component1] to [component2]",
    "Remove [component]",
    "Move [component] to [position]"
  ];

  if (diagramType === "architecture") {
    return [
      ...baseSuggestions,
      "Add a load balancer",
      "Replace EC2 with Lambda",
      "Add S3 bucket for storage",
      "Connect API Gateway to Lambda",
      "Add CloudFront CDN"
    ];
  } else if (diagramType === "flowchart") {
    return [
      ...baseSuggestions,
      "Add a decision point",
      "Add a process step",
      "Add error handling",
      "Add a loop",
      "Add parallel processing"
    ];
  } else if (diagramType === "sequence") {
    return [
      ...baseSuggestions,
      "Add a new actor",
      "Add a response message",
      "Add error handling",
      "Add timeout handling",
      "Add parallel messages"
    ];
  }

  return baseSuggestions;
}
