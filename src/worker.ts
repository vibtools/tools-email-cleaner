
const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

const CORRECTIONS: Record<string, string> = {
  'gamil.com': 'gmail.com',
  'hotmal.com': 'hotmail.com',
  'yaho.com': 'yahoo.com',
  'outlok.com': 'outlook.com',
  'gmial.com': 'gmail.com',
  'gmal.com': 'gmail.com',
  'gnail.com': 'gmail.com',
  'icloud.cm': 'icloud.com',
  'outlook.cm': 'outlook.com'
};

self.onmessage = (e) => {
  const { input, options, domainFilter } = e.data;

  if (!input || !input.trim()) {
    self.postMessage({
      output: '',
      results: [],
      stats: { total: 0, duplicates: 0, invalid: 0, cleaned: 0, corrected: 0 },
      domainCounts: {}
    });
    return;
  }

  // 1. Extract all potential emails
  const matches = input.match(emailRegex) || [];
  const rawTotal = matches.length;

  let results = matches.map(email => ({
    original: email,
    email: options.toLowercase ? email.toLowerCase() : email,
    status: 'valid' as 'valid' | 'corrected' | 'suspicious'
  }));

  // 2. Auto-Correction
  let correctedCount = 0;
  results = results.map(item => {
    const [user, domain] = item.email.split('@');
    if (CORRECTIONS[domain]) {
      correctedCount++;
      return {
        ...item,
        email: `${user}@${CORRECTIONS[domain]}`,
        status: 'corrected'
      };
    }
    
    // Suspicious check (e.g. very long domain or unusual characters)
    if (domain.length > 50 || /[0-9]{5,}/.test(domain)) {
      return { ...item, status: 'suspicious' };
    }

    return item;
  });

  let processed = results;

  // 3. Remove Invalid
  let invalidCount = 0;
  if (options.removeInvalid) {
    processed = processed.filter(item => {
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.email);
      if (!isValid) invalidCount++;
      return isValid;
    });
  }

  // 4. Remove Duplicates
  let duplicatesCount = 0;
  if (options.removeDuplicates) {
    const unique = new Set();
    const filtered = [];
    for (let i = 0; i < processed.length; i++) {
      const item = processed[i];
      if (!unique.has(item.email)) {
        unique.add(item.email);
        filtered.push(item);
      } else {
        duplicatesCount++;
      }
    }
    processed = filtered;
  }

  // 5. Filter by Domain
  if (domainFilter && domainFilter.trim()) {
    const filters = domainFilter.toLowerCase().split(',').map(f => f.trim()).filter(f => f);
    if (filters.length > 0) {
      processed = processed.filter(item => {
        const domain = item.email.split('@')[1];
        return filters.some(f => domain.includes(f));
      });
    }
  }

  // 6. Sort
  if (options.sortAlphabetically) {
    processed.sort((a, b) => a.email.localeCompare(b.email));
  }

  // 7. Domain Counts
  const counts: Record<string, number> = {};
  for (let i = 0; i < processed.length; i++) {
    const domain = processed[i].email.split('@')[1];
    if (domain) {
      counts[domain] = (counts[domain] || 0) + 1;
    }
  }

  self.postMessage({
    output: processed.map(i => i.email).join('\n'),
    results: processed,
    stats: {
      total: rawTotal,
      duplicates: duplicatesCount,
      invalid: invalidCount,
      cleaned: processed.length,
      corrected: correctedCount
    },
    domainCounts: counts
  });
};
