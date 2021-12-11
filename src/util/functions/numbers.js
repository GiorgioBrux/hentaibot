export default {
    number_to_ordinal(number) {
        const special = [
            'zeroth',
            'first',
            'second',
            'third',
            'fourth',
            'fifth',
            'sixth',
            'seventh',
            'eighth',
            'ninth',
            'tenth',
            'eleventh',
            'twelvth',
            'thirteenth',
            'fourteenth',
            'fifteenth',
            'sixteenth',
            'seventeenth',
            'eighteenth',
            'nineteenth'
        ];
        const deca = ['twent', 'thirt', 'fourt', 'fift', 'sixt', 'sevent', 'eight', 'ninet'];

        if (number < 20) return special[number];
        if (number % 10 === 0) return `${deca[Math.floor(number / 10) - 2]}ieth`;
        return `${deca[Math.floor(number / 10) - 2]}y-${special[number % 10]}`;
    }
};
