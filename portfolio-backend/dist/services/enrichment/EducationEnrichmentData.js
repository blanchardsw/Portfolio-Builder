"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EducationEnrichmentData = void 0;
/**
 * Education enrichment data following Single Responsibility Principle
 * Handles institution-specific normalization and known mappings
 */
class EducationEnrichmentData {
    constructor() {
        this.knownInstitutions = {
            'university of louisiana at lafayette': 'https://www.louisiana.edu',
            'ull': 'https://www.louisiana.edu',
            'louisiana': 'https://www.louisiana.edu',
            'harvard university': 'https://www.harvard.edu',
            'harvard': 'https://www.harvard.edu',
            'stanford university': 'https://www.stanford.edu',
            'stanford': 'https://www.stanford.edu',
            'mit': 'https://www.mit.edu',
            'massachusetts institute of technology': 'https://www.mit.edu',
            'university of california berkeley': 'https://www.berkeley.edu',
            'uc berkeley': 'https://www.berkeley.edu',
            'berkeley': 'https://www.berkeley.edu',
            'university of texas at austin': 'https://www.utexas.edu',
            'ut austin': 'https://www.utexas.edu',
            'georgia institute of technology': 'https://www.gatech.edu',
            'georgia tech': 'https://www.gatech.edu',
            'carnegie mellon university': 'https://www.cmu.edu',
            'carnegie mellon': 'https://www.cmu.edu',
            'cmu': 'https://www.cmu.edu',
            'university of washington': 'https://www.washington.edu',
            'uw': 'https://www.washington.edu',
            'university of michigan': 'https://www.umich.edu',
            'umich': 'https://www.umich.edu',
            'michigan': 'https://www.umich.edu',
            'yale university': 'https://www.yale.edu',
            'yale': 'https://www.yale.edu',
            'princeton university': 'https://www.princeton.edu',
            'princeton': 'https://www.princeton.edu',
            'columbia university': 'https://www.columbia.edu',
            'columbia': 'https://www.columbia.edu',
            'university of pennsylvania': 'https://www.upenn.edu',
            'upenn': 'https://www.upenn.edu',
            'penn': 'https://www.upenn.edu',
            'cornell university': 'https://www.cornell.edu',
            'cornell': 'https://www.cornell.edu',
            'caltech': 'https://www.caltech.edu',
            'california institute of technology': 'https://www.caltech.edu',
            'university of southern california': 'https://www.usc.edu',
            'usc': 'https://www.usc.edu',
            'new york university': 'https://www.nyu.edu',
            'nyu': 'https://www.nyu.edu'
        };
    }
    getKnownMappings() {
        return this.knownInstitutions;
    }
    normalizeKey(institution) {
        return institution.toLowerCase()
            .replace(/\b(university|college|institute|school)\b/g, '')
            .replace(/[^\w\s]/g, '')
            .trim();
    }
    getKeyFromItem(item) {
        const education = item;
        return education.institution;
    }
}
exports.EducationEnrichmentData = EducationEnrichmentData;
//# sourceMappingURL=EducationEnrichmentData.js.map