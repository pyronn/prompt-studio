/**
 * Represents a part of a prompt with its associated weight.
 */
export interface TextPromptPart {
    id: string;
    text: string;
    weight: number;
    translation?: string;
    isActivated: boolean;
    isSaved: boolean;
}

/**
 * Represents a fully parsed Midjourney prompt.
 */
export interface ParsedPrompt {
    textPrompts: TextPromptPart[];
    imagePrompts: string[];
    systemParameters: Record<string, string>;
    negativePrompts: string[];
}

/**
 * Custom error class for invalid prompt inputs.
 */
class InvalidPromptError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidPromptError';
    }
}

// Pre-compile frequently used regular expressions for better performance
const URL_REGEX = /(https?:\/\/\S+)/g;
const WEIGHT_REGEX = /^(-?\d+(\.\d+)?)/;

/**
 * Parses a Midjourney prompt string into its component parts.
 * @param input The raw prompt string to parse.
 * @returns A ParsedPrompt object containing the parsed components.
 * @throws {InvalidPromptError} If the input is invalid or cannot be parsed.
 */
export function parseMidjourneyPrompt(input: string): ParsedPrompt {
    if (!input || typeof input !== 'string') {
        throw new InvalidPromptError('Input must be a non-empty string');
    }

    const parts = splitPromptIntoParts(input);
    const systemParams = parseSystemParameters(parts.systemParameters);

    return {
        imagePrompts: parseImagePrompts(parts.imagePrompts),
        textPrompts: parseTextPrompts(parts.textPrompts),
        systemParameters: systemParams,
        negativePrompts: systemParams.no ? systemParams.no.split(',').map(p => p.trim()) : [],
    };
}

/**
 * Splits the input prompt into its major components: image URLs, text prompts, and system parameters.
 * @param input The raw prompt string to split.
 * @returns An object containing the split components.
 */
function splitPromptIntoParts(input: string): { imagePrompts: string, textPrompts: string, systemParameters: string } {
    const parts = input.split(/\s+(--\w+)/);
    let imageAndTextPart = parts[0];
    let systemParamsPart = parts.slice(1).join(' ');

    const imageUrls = imageAndTextPart.match(URL_REGEX) || [];
    const textPromptspart = imageAndTextPart.replace(URL_REGEX, '').trim();

    return {
        imagePrompts: imageUrls.join(' '),
        textPrompts: textPromptspart,
        systemParameters: systemParamsPart,
    };
}

/**
 * Parses the image prompts string into an array of image URLs.
 * @param imagePromptsString The string containing image URLs.
 * @returns An array of image URL strings.
 */
function parseImagePrompts(imagePromptsString: string): string[] {
    return imagePromptsString.split(/\s+/).filter(Boolean);
}

/**
 * Parses the text prompts string into an array of PromptPart objects.
 * @param textPromptsString The string containing text prompts.
 * @returns An array of PromptPart objects.
 */
function parseTextPrompts(textPromptsString: string): TextPromptPart[] {
    const commaPrompts = textPromptsString.split(',').map(p => p.trim()).filter(Boolean);

    const weightedPrompts = commaPrompts.flatMap(parsePromptWithWeight);

    const result: TextPromptPart[] = [];
    for (const prompt of weightedPrompts) {
        const sentenceParts = prompt.text.split('.').map(p => p.trim()).filter(Boolean);
        for (const part of sentenceParts) {
            const id = Math.random().toString(36).slice(2, 9)
            result.push({
                id: id,
                text: part,
                weight: prompt.weight,
                translation: '',
                isActivated: true,
                isSaved: false
            });
        }
    }

    return result;
}

/**
 * Parses a single prompt string, potentially with a weight specifier.
 * @param prompt The prompt string to parse.
 * @returns An array of PromptPart objects.
 */
function parsePromptWithWeight(prompt: string): TextPromptPart[] {
    const parts = prompt.split('::');

    if (parts.length === 1) {
        const id = Math.random().toString(36).slice(2, 9)
        return [{id: id, text: prompt.trim(), weight: 1, translation: '', isActivated: true, isSaved: false}];
    }

    const p1 = parts[0].trim();
    const p2 = parts.slice(1).join('::').trim();

    const weightMatch = p2.match(WEIGHT_REGEX);

    if (!weightMatch) {
        const id = Math.random().toString(36).slice(2, 9)
        return [{id: id, text: prompt, weight: 1, translation: '', isActivated: true, isSaved: false}];
    }

    const weight = parseFloat(weightMatch[0]);
    const remainingText = p2.slice(weightMatch[0].length).trim();

    if (!p1 && !remainingText) {
        return [];
    }

    const result: TextPromptPart[] = [];

    if (p1) {
        const id = Math.random().toString(36).slice(2, 9)
        result.push({
            id: id,
            text: p1,
            weight: isNaN(weight) || weight < -0.5 || weight > 2 ? 1 : weight,
            translation: '',
            isActivated: true,
            isSaved: false
        });
    }

    if (remainingText) {
        result.push(...parsePromptWithWeight(remainingText));
    }

    return result;
}

/**
 * Parses the system parameters string into a key-value object.
 * @param systemParamsString The string containing system parameters.
 * @returns An object with system parameters as key-value pairs.
 */
function parseSystemParameters(systemParamsString: string): Record<string, string> {
    const params: Record<string, string> = {};

    const paramPairs = systemParamsString.split('--').filter(Boolean);

    for (const pair of paramPairs) {
        const [paramName, ...paramValueParts] = pair.trim().split(' ');
        const paramValue = paramValueParts.join(' ').trim();

        if (paramName) {
            if (paramName === 'no') {
                params[paramName] = paramValue;
            } else if (paramName === 'p' || paramName === 'personalize') {
                params[paramName] = paramValue || 'true';
            } else if (paramValue) {
                params[paramName] = paramValue;
            }
        }
    }

    return params;
}

/**
 * Formats a ParsedPrompt object back into a Midjourney prompt string.
 * @param parsedPrompt The ParsedPrompt object to format.
 * @returns A formatted string representing the Midjourney prompt.
 */
export function formatParsedPrompt(parsedPrompt: ParsedPrompt): string {
    const parts: string[] = [];

    // Format text prompts
    const textPrompts = parsedPrompt.textPrompts.map(prompt => {
        if (prompt.weight !== 1) {
            return `(${prompt.text}::${prompt.weight})`;
        }
        return prompt.text;
    }).join(', ');
    if (textPrompts) {
        parts.push(textPrompts);
    }

    // Add image prompts
    if (parsedPrompt.imagePrompts.length > 0) {
        parts.push(parsedPrompt.imagePrompts.join(' '));
    }

    // Add system parameters
    for (const [key, value] of Object.entries(parsedPrompt.systemParameters)) {
        if (key === 'no') {
            continue; // We'll handle negative prompts separately
        }
        if (key === 'p' || key === 'personalize') {
            parts.push(value === 'true' ? `--${key}` : `--${key} ${value}`);
        } else {
            parts.push(`--${key} ${value}`);
        }
    }

    // Add negative prompts
    if (parsedPrompt.negativePrompts.length > 0) {
        parts.push(`--no ${parsedPrompt.negativePrompts.join(', ')}`);
    }

    return parts.join(' ');
}

/**
 * Compares two ParsedPrompt objects for equality.
 * @param prompt1 The first ParsedPrompt object.
 * @param prompt2 The second ParsedPrompt object.
 * @returns True if the prompts are equal, false otherwise.
 */
export function arePromptsEqual(prompt1: ParsedPrompt, prompt2: ParsedPrompt): boolean {
    return (
        JSON.stringify(prompt1.textPrompts) === JSON.stringify(prompt2.textPrompts) &&
        JSON.stringify(prompt1.imagePrompts) === JSON.stringify(prompt2.imagePrompts) &&
        JSON.stringify(prompt1.systemParameters) === JSON.stringify(prompt2.systemParameters) &&
        JSON.stringify(prompt1.negativePrompts) === JSON.stringify(prompt2.negativePrompts)
    );
}
