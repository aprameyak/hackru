// NLP Service for processing voice input and extracting user preferences
// This service uses pattern matching and keyword extraction to understand user preferences

interface ExtractedPreferences {
  budget?: number;
  location?: string;
  lifestylePreferences?: {
    cleanliness?: string;
    noise?: string;
    guests?: string;
    pets?: string;
    smoking?: string;
    partying?: string;
    study?: string;
  };
  age?: number;
  university?: string;
  interests?: string[];
}

export class NLPService {
  // Budget extraction patterns
  private static budgetPatterns = [
    /(\$?\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:per\s*month|monthly|a\s*month)/gi,
    /budget\s*(?:of\s*)?(\$?\d+(?:,\d{3})*(?:\.\d{2})?)/gi,
    /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:dollars?|bucks?)/gi,
    /around\s*(\$?\d+(?:,\d{3})*(?:\.\d{2})?)/gi,
  ];

  // Location extraction patterns
  private static locationPatterns = [
    /(?:near|close\s*to|around)\s*([A-Za-z\s]+(?:university|college|school))/gi,
    /(?:at|in)\s*([A-Za-z\s]+(?:university|college|school))/gi,
    /([A-Za-z\s]+(?:university|college|school))/gi,
    /(?:near|in|at)\s*([A-Za-z\s]+(?:campus|downtown|city))/gi,
  ];

  // Lifestyle preference patterns
  private static lifestylePatterns = {
    cleanliness: [
      /(?:very\s*)?clean/gi,
      /neat/gi,
      /tidy/gi,
      /organized/gi,
      /messy/gi,
      /(?:not\s*)?clean/gi,
    ],
    noise: [
      /quiet/gi,
      /silent/gi,
      /loud/gi,
      /noisy/gi,
      /peaceful/gi,
      /(?:not\s*)?loud/gi,
    ],
    guests: [
      /(?:no\s*)?guests/gi,
      /(?:no\s*)?visitors/gi,
      /(?:no\s*)?friends/gi,
      /occasional/gi,
      /frequent/gi,
      /(?:not\s*)?social/gi,
    ],
    pets: [
      /(?:no\s*)?pets/gi,
      /(?:no\s*)?animals/gi,
      /(?:no\s*)?dogs/gi,
      /(?:no\s*)?cats/gi,
      /pet\s*friendly/gi,
    ],
    smoking: [
      /(?:no\s*)?smoking/gi,
      /(?:no\s*)?cigarettes/gi,
      /(?:no\s*)?vaping/gi,
      /smoke\s*free/gi,
    ],
    partying: [
      /(?:no\s*)?partying/gi,
      /(?:no\s*)?parties/gi,
      /(?:no\s*)?drinking/gi,
      /(?:no\s*)?alcohol/gi,
      /social/gi,
    ],
    study: [
      /study/gi,
      /studying/gi,
      /academic/gi,
      /focused/gi,
      /(?:not\s*)?distracted/gi,
    ],
  };

  // Age extraction patterns
  private static agePatterns = [
    /(\d{1,2})\s*(?:years?\s*old|yo)/gi,
    /age\s*(\d{1,2})/gi,
    /(\d{1,2})\s*(?:years?)/gi,
  ];

  // University extraction patterns
  private static universityPatterns = [
    /(?:at|in|from)\s*([A-Za-z\s]+(?:university|college|school))/gi,
    /([A-Za-z\s]+(?:university|college|school))/gi,
    /(?:studying|student)\s*(?:at|in)\s*([A-Za-z\s]+)/gi,
  ];

  // Interest extraction patterns
  private static interestKeywords = [
    'gaming', 'video games', 'sports', 'fitness', 'gym', 'running', 'biking',
    'music', 'guitar', 'piano', 'singing', 'art', 'painting', 'drawing',
    'cooking', 'baking', 'reading', 'books', 'movies', 'netflix', 'tv',
    'travel', 'hiking', 'outdoor', 'nature', 'photography', 'dancing',
    'programming', 'coding', 'tech', 'startup', 'entrepreneur',
  ];

  static extractPreferences(text: string): ExtractedPreferences {
    const preferences: ExtractedPreferences = {
      lifestylePreferences: {},
    };

    // Extract budget
    const budget = this.extractBudget(text);
    if (budget) {
      preferences.budget = budget;
    }

    // Extract location
    const location = this.extractLocation(text);
    if (location) {
      preferences.location = location;
    }

    // Extract age
    const age = this.extractAge(text);
    if (age) {
      preferences.age = age;
    }

    // Extract university
    const university = this.extractUniversity(text);
    if (university) {
      preferences.university = university;
    }

    // Extract lifestyle preferences
    const lifestylePrefs = this.extractLifestylePreferences(text);
    if (Object.keys(lifestylePrefs).length > 0) {
      preferences.lifestylePreferences = lifestylePrefs;
    }

    // Extract interests
    const interests = this.extractInterests(text);
    if (interests.length > 0) {
      preferences.interests = interests;
    }

    return preferences;
  }

  private static extractBudget(text: string): number | null {
    for (const pattern of this.budgetPatterns) {
      const match = pattern.exec(text);
      if (match) {
        const amount = match[1].replace(/[$,]/g, '');
        const num = parseFloat(amount);
        if (!isNaN(num) && num > 0) {
          return num;
        }
      }
    }
    return null;
  }

  private static extractLocation(text: string): string | null {
    for (const pattern of this.locationPatterns) {
      const match = pattern.exec(text);
      if (match) {
        return match[1].trim();
      }
    }
    return null;
  }

  private static extractAge(text: string): number | null {
    for (const pattern of this.agePatterns) {
      const match = pattern.exec(text);
      if (match) {
        const age = parseInt(match[1]);
        if (!isNaN(age) && age > 0 && age < 100) {
          return age;
        }
      }
    }
    return null;
  }

  private static extractUniversity(text: string): string | null {
    for (const pattern of this.universityPatterns) {
      const match = pattern.exec(text);
      if (match) {
        return match[1].trim();
      }
    }
    return null;
  }

  private static extractLifestylePreferences(text: string): any {
    const preferences: any = {};

    for (const [key, patterns] of Object.entries(this.lifestylePatterns)) {
      for (const pattern of patterns) {
        const match = pattern.exec(text);
        if (match) {
          const matchedText = match[0].toLowerCase();
          
          // Determine preference value based on context
          if (matchedText.includes('no ') || matchedText.includes('not ')) {
            preferences[key] = 'none';
          } else if (matchedText.includes('very ')) {
            preferences[key] = 'high';
          } else if (matchedText.includes('occasional') || matchedText.includes('sometimes')) {
            preferences[key] = 'occasional';
          } else if (matchedText.includes('frequent') || matchedText.includes('often')) {
            preferences[key] = 'frequent';
          } else {
            preferences[key] = 'moderate';
          }
          break;
        }
      }
    }

    return preferences;
  }

  private static extractInterests(text: string): string[] {
    const interests: string[] = [];
    const lowerText = text.toLowerCase();

    for (const keyword of this.interestKeywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        interests.push(keyword);
      }
    }

    return interests;
  }

  // Generate a summary of extracted preferences
  static generateSummary(preferences: ExtractedPreferences): string {
    const parts: string[] = [];

    if (preferences.budget) {
      parts.push(`Budget: $${preferences.budget}/month`);
    }

    if (preferences.age) {
      parts.push(`Age: ${preferences.age}`);
    }

    if (preferences.location) {
      parts.push(`Location: ${preferences.location}`);
    }

    if (preferences.university) {
      parts.push(`University: ${preferences.university}`);
    }

    if (preferences.lifestylePreferences) {
      const lifestyle = preferences.lifestylePreferences;
      const lifestyleParts: string[] = [];
      
      if (lifestyle.cleanliness) {
        lifestyleParts.push(`Cleanliness: ${lifestyle.cleanliness}`);
      }
      if (lifestyle.noise) {
        lifestyleParts.push(`Noise level: ${lifestyle.noise}`);
      }
      if (lifestyle.guests) {
        lifestyleParts.push(`Guests: ${lifestyle.guests}`);
      }
      if (lifestyle.pets) {
        lifestyleParts.push(`Pets: ${lifestyle.pets}`);
      }

      if (lifestyleParts.length > 0) {
        parts.push(`Lifestyle: ${lifestyleParts.join(', ')}`);
      }
    }

    if (preferences.interests && preferences.interests.length > 0) {
      parts.push(`Interests: ${preferences.interests.join(', ')}`);
    }

    return parts.length > 0 ? parts.join('\n') : 'No preferences detected';
  }
}
