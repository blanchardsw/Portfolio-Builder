"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyEnrichmentData = void 0;
/**
 * Company enrichment data following Single Responsibility Principle
 * Handles company-specific normalization and known mappings
 */
class CompanyEnrichmentData {
    constructor() {
        this.knownCompanies = {
            'google': 'https://www.google.com',
            'microsoft': 'https://www.microsoft.com',
            'apple': 'https://www.apple.com',
            'amazon': 'https://www.amazon.com',
            'facebook': 'https://www.facebook.com',
            'meta': 'https://www.meta.com',
            'netflix': 'https://www.netflix.com',
            'spotify': 'https://www.spotify.com',
            'airbnb': 'https://www.airbnb.com',
            'uber': 'https://www.uber.com',
            'lyft': 'https://www.lyft.com',
            'tesla': 'https://www.tesla.com',
            'kaseya': 'https://www.kaseya.com',
            'ainsworth game technology': 'https://www.ainsworth.com.au',
            'ainsworth': 'https://www.ainsworth.com.au',
            'ibm': 'https://www.ibm.com',
            'oracle': 'https://www.oracle.com',
            'salesforce': 'https://www.salesforce.com',
            'adobe': 'https://www.adobe.com',
            'intel': 'https://www.intel.com',
            'nvidia': 'https://www.nvidia.com',
            'amd': 'https://www.amd.com',
            'cisco': 'https://www.cisco.com',
            'vmware': 'https://www.vmware.com',
            'red hat': 'https://www.redhat.com',
            'redhat': 'https://www.redhat.com',
            'mongodb': 'https://www.mongodb.com',
            'atlassian': 'https://www.atlassian.com',
            'slack': 'https://slack.com',
            'zoom': 'https://zoom.us',
            'dropbox': 'https://www.dropbox.com',
            'github': 'https://github.com',
            'gitlab': 'https://gitlab.com',
            'bitbucket': 'https://bitbucket.org',
            'jira': 'https://www.atlassian.com/software/jira',
            'confluence': 'https://www.atlassian.com/software/confluence',
            'first american title': 'https://www.firstam.com',
            'first american': 'https://www.firstam.com',
            'enterprise data concepts': 'https://edcnow.com',
            'edc': 'https://edcnow.com'
        };
    }
    getKnownMappings() {
        return this.knownCompanies;
    }
    normalizeKey(company) {
        return company.toLowerCase()
            .replace(/\b(inc|corp|corporation|ltd|limited|llc|company|co)\b\.?/g, '')
            .replace(/[^\w\s]/g, '')
            .trim();
    }
    getKeyFromItem(item) {
        const workExp = item;
        return workExp.company;
    }
}
exports.CompanyEnrichmentData = CompanyEnrichmentData;
//# sourceMappingURL=CompanyEnrichmentData.js.map