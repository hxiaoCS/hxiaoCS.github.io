let currentScene = 0;
const scenes = [
    { code: 'USA', country: 'United States' },
    { code: 'CHN', country: 'China' },
    { code: 'DEU', country: 'Germany' },
    { code: 'ALL', country: 'All Countries' } // Fourth scene for reader-driven content
];

function fetchData(){
    if (currentScene < 3){
        let countryCode = scenes[currentScene].code;
        const totalPromise = d3.json(`https://api.worldbank.org/v2/country/${countryCode}/indicator/SP.POP.TOTL?date=1970:2023&format=json`);
        const malePromise = d3.json(`https://api.worldbank.org/v2/country/${countryCode}/indicator/SP.POP.TOTL.MA.IN?date=1970:2023&format=json`);
        const femalePromise = d3.json(`https://api.worldbank.org/v2/country/${countryCode}/indicator/SP.POP.TOTL.FE.IN?date=1970:2023&format=json`);
        Promise.all([totalPromise, malePromise, femalePromise])
            .then(results => {
                const [totalData, maleData, femaleData] = results;
    
                scenes[currentScene]['total'] = totalData[1];
                scenes[currentScene]['male'] = maleData[1];
                scenes[currentScene]['female'] = femaleData[1];
    
                updateVisualization();
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                alert(`Cannot fetch the required data for ${scenes[currentScene].country} from World Bank due to the API issue.`);
            });
    }
    else{
        updateVisualization();
    }
}

function updateVisualization() {
    d3.select('#visualization').selectAll('*').remove();

    const svg = d3.select('#visualization')
        .append('svg')
        .attr('width', 800)
        .attr('height', 600);

    const margin = { top: 50, right: 50, bottom: 50, left: 100 };
    const width = 800 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

        const legendData = [
            { label: 'Total', color: 'green' },
            { label: 'Male', color: 'red' },
            { label: 'Female', color: 'blue' }
        ];
    
        const legend = g.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${width - 100}, 50)`);
    
        legend.selectAll('rect')
            .data(legendData)
            .enter()
            .append('rect')
            .attr('x', 0)
            .attr('y', (d, i) => i * 20)
            .attr('width', 18)
            .attr('height', 18)
            .style('fill', d => d.color);
    
        legend.selectAll('text')
            .data(legendData)
            .enter()
            .append('text')
            .attr('x', 24)
            .attr('y', (d, i) => i * 20 + 9)
            .attr('dy', '0.35em')
            .text(d => d.label);
    
    if (currentScene < 3){
        let countryName = scenes[currentScene].country;
        const scene = scenes[currentScene];
        const totalData = scene.total;
        const maleData = scene.male;
        const femaleData = scene.female;
    
        const x = d3.scaleLinear()
            .domain([1970, 2023])
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(totalData, d => d.value)])
            .range([height, 0]);

        // Update description
        if(currentScene == 0){
            d3.select('#description')
            .html(`<strong>${countryName}</strong> population data from 1970 to 2023 is visualized in this graph. The green line represents the total population, the red line shows the male population, and the blue line illustrates the female population. Here are some key observations:
            
            <ul>
                <li>The total population of ${countryName} increased steadily from approximately 200 million to nearly 340 million.</li>
                <li>Both male and female populations showed steady growth over this period.</li>
                <li>The gap between the male and female populations decreased, indicating a more balanced gender distribution.</li>
                <li>This growth reflects various factors such as immigration, birth rates, and overall economic stability contributing to the population increase.</li>
            </ul>
    
            This visualization helps in understanding demographic trends and planning for future needs in areas like healthcare, education, and infrastructure.`);
        }
        else if (currentScene == 1){
            d3.select('#description')
            .html(`<strong>${countryName}</strong> population data from 1970 to 2023 is visualized in this graph. The green line represents the total population, the red line shows the male population, and the blue line illustrates the female population. Here are some key observations:
            
            <ul>
                <li>China's population experienced substantial growth, rising from 900 million to 1.4 billion.</li>
                <li>The male population increased at a faster rate compared to the female population, exacerbating the gender imbalance.</li>
                <li>This trend can be attributed to historical policies and cultural preferences for male children.</li>
                <li>Around 2018, the population growth rate began to stabilize, indicating a shift in demographic trends.</li>
                <li>This stabilization could be due to changes in government policies, economic factors, and societal shifts.</li>
            </ul>
    
            This visualization helps in understanding demographic trends and planning for future needs in areas like healthcare, education, and infrastructure.`);
        }
        else{
            d3.select('#description')
            .html(`<strong>${countryName}</strong> population data from 1970 to 2023 is visualized in this graph. The green line represents the total population, the red line shows the male population, and the blue line illustrates the female population. Here are some key observations:
            
            <ul>
                <li>Germany's population showed fluctuations around 80 million before stabilizing and increasing steadily after 2015.</li>
                <li>The gender gap narrowed significantly over the years, reflecting a more balanced population distribution between males and females.</li>
                <li>This stabilization and eventual increase could be linked to migration policies, economic factors, and social programs encouraging higher birth rates.</li>
                <li>The data suggests a trend towards demographic stability, with potential implications for workforce and economic planning.</li>
            </ul>
    
            This visualization helps in understanding demographic trends and planning for future needs in areas like healthcare, education, and infrastructure.`);
        }

        g.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format('d')));

        g.append('g')
            .call(d3.axisLeft(y));

        g.append('path')
            .datum(femaleData)
            .attr('fill', 'none')
            .attr('stroke', 'blue')
            .attr('stroke-width', 1.5)
            .attr('d', d3.line()
                .x(d => x(d.date))
                .y(d => y(d.value))
            );

        g.append('path')
            .datum(maleData)
            .attr('fill', 'none')
            .attr('stroke', 'red')
            .attr('stroke-width', 1.5)
            .attr('d', d3.line()
                .x(d => x(d.date))
                .y(d => y(d.value))
            );

        g.append('path')
            .datum(totalData)
            .attr('fill', 'none')
            .attr('stroke', 'green')
            .attr('stroke-width', 1.5)
            .attr('d', d3.line()
                .x(d => x(d.date))
                .y(d => y(d.value))
            );

        g.append('text')
            .attr('x', width / 2)
            .attr('y', -20)
            .attr('text-anchor', 'middle')
            .attr('font-size', '24px')
            .text(`${countryName} Population Data (1970-2023)`);

            // Show the "Next" button and hide the "Start Over" button
            d3.select('#next').style('display', 'inline-block');
            d3.select('#start-over').style('display', 'none');

            addAnnotations(g, width, height, currentScene);
    }
    else{
            // Interactive comparison scene
            const countries = scenes.slice(0, 3); // Only the first three countries

            const filters = d3.select('#visualization')
                .append('div')
                .attr('class', 'filters');

            filters.append('label')
            .text('Select Gender(s): ')
            .style('margin-right', '5px');
        
            const genders = ['Total', 'Male', 'Female'];
            genders.forEach(gender => {
                filters.append('input')
                    .attr('type', 'checkbox')
                    .attr('id', `gender-${gender.toLowerCase()}`)
                    .attr('value', gender.toLowerCase())
                    .attr('checked', true);
                filters.append('label')
                    .attr('for', `gender-${gender.toLowerCase()}`)
                    .text(gender);
            });
    
            filters.append('label')
            .text('Select Country(s): ')
            .style('margin-left', '50px');

            countries.forEach(country => {
                filters.append('input')
                    .attr('type', 'checkbox')
                    .attr('id', `country-${country.code}`)
                    .attr('value', country.code)
                    .attr('checked', true);
                filters.append('label')
                    .attr('for', `country-${country.code}`)
                    .text(country.country);
            });

            // Event listeners for filters
            d3.selectAll('input[type=checkbox]').on('change', updateInteractiveVisualization);

            updateInteractiveVisualization(); 
    }

    function updateInteractiveVisualization() {
        const selectedGenders = Array.from(d3.selectAll('input[id^="gender-"]:checked').nodes()).map(input => input.value);
        const selectedCountries = Array.from(d3.selectAll('input[id^="country-"]:checked').nodes()).map(input => input.value);
        
        g.selectAll('*').remove(); // Clear the previous visualization

        const x = d3.scaleLinear()
            .domain([1970, 2023])
            .range([0, width]);

        // Calculate the consistent y-axis domain across all scenes
            const yMax = d3.max(scenes.flatMap(scene => 
                selectedCountries.includes(scene.code) 
                ? selectedGenders.flatMap(gender => 
                    scene[gender]?.map(d => d.value) || []
                  )
                : []
            ));

        const y = d3.scaleLinear()
            .domain([0, yMax])
            .range([height, 0]);

        g.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x).tickFormat(d3.format('d')));

        g.append('g')
            .call(d3.axisLeft(y));

        const lineTypes = {
            total: 'solid',
            male: 'dashed',
            female: 'dotted'
        };

        const colors = {
            USA: 'green',
            CHN: 'blue',
            DEU: 'red'
        };

        selectedCountries.forEach(countryCode => {
            selectedGenders.forEach(gender => {
                g.append('path')
                    .datum(scenes.find(scene => scene.code === countryCode)[gender])
                    .attr('fill', 'none')
                    .attr('stroke', colors[countryCode])
                    .attr('stroke-width', 1.5)
                    .attr('stroke-dasharray', lineTypes[gender] === 'solid' ? '0' : lineTypes[gender] === 'dashed' ? '4,4' : '1,4')
                    .attr('d', d3.line()
                        .x(d => x(d.date))
                        .y(d => y(d.value))
                    )
                    .attr('class', `${countryCode}-${gender}`);
            });
        });

        g.append('text')
            .attr('x', width / 2)
            .attr('y', -20)
            .attr('text-anchor', 'middle')
            .attr('font-size', '24px')
            .text('Population Data Comparison (1970-2023)');

        // Legend
        const colorLegendData = [
            { label: 'USA', color: 'green' },
            { label: 'Germany', color: 'red' },
            { label: 'China', color: 'blue' }
        ];
    
        const colorLegend = g.append('g')
            .attr('class', 'colorLegend')
            .attr('transform', `translate(${width - 50}, ${margin.top + 30})`);
    
        colorLegend.selectAll('rect')
            .data(colorLegendData)
            .enter()
            .append('rect')
            .attr('x', 0)
            .attr('y', (d, i) => i * 20)
            .attr('width', 18)
            .attr('height', 18)
            .style('fill', d => d.color);
    
        colorLegend.selectAll('text')
            .data(colorLegendData)
            .enter()
            .append('text')
            .attr('x', 24)
            .attr('y', (d, i) => i * 20 + 9)
            .attr('dy', '0.35em')
            .text(d => d.label);

        
        const legend = svg.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${width + 50},${margin.top + 30})`);

        const legendData = [
            { label: 'Total', color: 'black', dash: 'solid' },
            { label: 'Male', color: 'black', dash: 'dashed' },
            { label: 'Female', color: 'black', dash: 'dotted' }
        ];

        legend.selectAll('line')
            .data(legendData)
            .enter()
            .append('line')
            .attr('x1', 0)
            .attr('y1', (d, i) => i * 20)
            .attr('x2', 20)
            .attr('y2', (d, i) => i * 20)
            .attr('stroke', d => d.color)
            .attr('stroke-width', 1.5)
            .attr('stroke-dasharray', d => d.dash === 'solid' ? '0' : d.dash === 'dashed' ? '4,4' : '1,4');

        legend.selectAll('text')
            .data(legendData)
            .enter()
            .append('text')
            .attr('x', 25)
            .attr('y', (d, i) => i * 20 + 5)
            .text(d => d.label);

        d3.select('#description')
            .html(`Use the checkboxes below to filter the data by gender and country. This interactive comparison allows you to explore population trends for the United States, China, and Germany from 1970 to 2023. Here are some key points to consider:
    
            <ul>
                <li>Select different genders to compare how male and female populations have changed over time in each country.</li>
                <li>Compare population trends between different countries to see which country has experienced the most significant growth or decline.</li>
                <li>Look for patterns or anomalies in the data that might indicate significant events or changes in demographic trends.</li>
            </ul>

            This interactive tool provides a deeper understanding of the demographic changes in these countries and allows for more personalized exploration of the data.`);

        // Show the "Next" button and hide the "Start Over" button
        d3.select('#start-over').style('display', 'inline-block');
        d3.select('#next').style('display', 'none');
    }
}

function addAnnotations(g, width, height, sceneIndex) {
    const annotationsData = [
        [
            {
                note: { label: "grows steadily", bgPadding: 5, title: "USA Population" },
                data: { date: 2005, value: 295500000 },
                dy: 30,
                dx: 10
            },
            {
                note: { label: "Gender gap decreases", bgPadding: 5 },
                data: { date: 2019, value: 163000000 },
                dy: -50,
                dx: 30
            }
        ],
        [
            {
                note: { label: "grows significantly", bgPadding: 5, title: "China Population" },
                data: { date: 1990, value: 1135000000 },
                dy: 50,
                dx: -10
            },
            {
                note: { label: "growth stabilizes", bgPadding: 5, title: "China Population" },
                data: { date: 2018, value: 1403000000 },
                dy: 50,
                dx: -100
            },
            {
                note: { label: "Male population grows faster", bgPadding: 20 },
                data: { date: 2005, value: 645000000 },
                dy: -50,
                dx: -30
            }
        ],
        [
            {
                note: { label: "fluctuates and increase steadily", bgPadding: 20, title: "Germany Population" },
                data: { date: 2011, value: 80200000 },
                dy: 30,
                dx: -50
            },
            {
                note: { label: "Gender gap decreases", bgPadding: 20 },
                data: { date: 2015, value: 40500000 },
                dy: -30,
                dx: 30
            }
        ]
    ];

    const type = d3.annotationLabel;
    const makeAnnotations = d3.annotation()
        .type(type)
        .accessors({
            x: d => d3.scaleLinear().domain([1970, 2023]).range([0, width])(d.date),
            y: d => d3.scaleLinear().domain([0, d3.max(scenes[sceneIndex].total, d => d.value)]).range([height, 0])(d.value)
        })
        .annotations(annotationsData[sceneIndex]);

    g.append('g')
        .attr('class', 'annotation-group')
        .call(makeAnnotations);
}

document.getElementById('next').addEventListener('click', () => {
    if (currentScene < scenes.length - 1) {
        currentScene += 1;
        fetchData();
    } else {
        alert("You are already at the last scene.");
    }
});

document.getElementById('start-over').addEventListener('click', () =>{
    currentScene = 0;
    fetchData();
});
fetchData();