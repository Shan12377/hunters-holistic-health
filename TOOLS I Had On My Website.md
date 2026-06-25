

Metabolic protocol generator

Maybe what can do now is use like the evidence based skills to put real, studies where applicable

\<\!DOCTYPE html\>  
\<html lang="en"\>  
\<head\>  
    \<meta charset="UTF-8"\>  
    \<meta name="viewport" content="width=device-width, initial-scale=1.0"\>  
    \<title\>Intelligent Metabolic Protocol Generator\</title\>  
    \<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700\&family=Playfair+Display:wght@700\&display=swap" rel="stylesheet"\>  
    \<style\>  
        :root {  
            \--primary-color: \#0077b6;  
            \--secondary-color: \#4CAF50;  
            \--text-color: \#333;  
            \--light-bg: \#e0f7fa;  
            \--card-bg: \#ffffff;  
            \--border-color: \#bde0fe;  
            \--accent-color: \#06d6a0;  
            \--heading-color: \#005f91;  
        }  
        body {  
            font-family: 'Montserrat', sans-serif;  
            margin: 0;  
            padding: 20px;  
            background-color: var(--light-bg);  
            color: var(--text-color);  
            line-height: 1.6;  
        }  
        .container {  
            max-width: 900px;  
            margin: 20px auto;  
            background-color: var(--card-bg);  
            border-radius: 12px;  
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);  
            overflow: hidden;  
        }  
        \#intakeForm { padding: 30px 40px; }  
        h1, h2, h3, h4 { font-family: 'Playfair Display', serif; color: var(--heading-color); }  
        h1 { font-size: 2.5em; text-align: center; margin-bottom: 20px; }  
        h2 { font-size: 1.8em; margin-top: 30px; border-bottom: 2px solid var(--secondary-color); padding-bottom: 10px; }  
        h3 { font-size: 1.4em; color: var(--secondary-color); margin-top: 25px; margin-bottom: 15px; }

        .form-step { display: none; }  
        .form-step.active { display: block; animation: fadeIn 0.5s; }  
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .form-group { margin-bottom: 25px; }  
        .symptom-category { margin-bottom: 20px; }  
        .symptom-category h4 { font-family: 'Montserrat', sans-serif; font-size: 1.1em; font-weight: 700; color: \#555; margin-bottom: 10px; }  
          
        label { display: block; font-weight: 600; margin-bottom: 10px; color: \#555; }  
        input\[type="text"\], input\[type="number"\], select, textarea {  
            width: 100%;  
            padding: 12px 15px;  
            border: 1px solid var(--border-color);  
            border-radius: 8px;  
            font-size: 1rem;  
            box-sizing: border-box;  
            transition: border-color 0.3s ease, box-shadow 0.3s ease;  
        }  
        input:focus, select:focus, textarea:focus {  
            border-color: var(--primary-color);  
            box-shadow: 0 0 0 3px rgba(0, 119, 182, 0.2);  
            outline: none;  
        }  
        .checkbox-group label {  
            display: flex;  
            align-items: center;  
            padding: 12px;  
            border-radius: 8px;  
            margin-bottom: 8px;  
            cursor: pointer;  
            border: 1px solid var(--border-color);  
            background-color: \#fafafa;  
        }  
        .checkbox-group input { margin-right: 12px; width: auto; transform: scale(1.2); accent-color: var(--primary-color); }

        .navigation-buttons { display: flex; justify-content: space-between; margin-top: 30px; }  
        button {  
            background-color: var(--primary-color);  
            color: white;  
            padding: 15px 30px;  
            border: none;  
            border-radius: 8px;  
            font-size: 1.1rem;  
            font-weight: 600;  
            cursor: pointer;  
            transition: background-color 0.3s ease, transform 0.2s ease;  
        }  
        button:hover { background-color: var(--heading-color); transform: translateY(-2px); }  
        button.prev { background-color: \#7f8c8d; }  
        button.prev:hover { background-color: \#95a5a6; }  
        \#generateButton { width: 100%; padding: 18px; font-size: 1.4em; background-color: var(--secondary-color); }  
        \#generateButton:hover { background-color: \#45a049; }

        /\* Results Page Styling \*/  
        \#resultsPage { display: none; padding: 40px; }  
        .results-header { text-align: center; border-bottom: 2px solid var(--primary-color); padding-bottom: 20px; margin-bottom: 30px; }  
          
        /\* NEW Blueprint Card \*/  
        .blueprint-card {  
            text-align: center;  
            padding: 30px;  
            margin-bottom: 30px;  
            border-radius: 12px;  
            border: 2px solid;  
        }  
        .blueprint-card.balanced { border-color: \#27ae60; background-color: \#e8f5e9; }  
        .blueprint-card.sugar-burner { border-color: \#f39c12; background-color: \#fffde7; }  
        .blueprint-card.hormonally-stressed { border-color: \#e74c3c; background-color: \#ffebee; }  
        .blueprint-card h2 { margin-top: 0; font-size: 2em; border-bottom: none; padding-bottom: 0;}  
        .blueprint-card p { margin: 10px 0 0 0; font-size: 1.1em; color: \#555; }  
        .blueprint-card .profile-name { font-weight: 700; font-size: 1.4em; }

        .roadmap-page { page-break-after: always; margin-bottom: 40px; }  
        .insight-card {  
            background-color: \#f9f9f9;  
            border-left: 5px solid var(--primary-color);  
            padding: 20px;  
            margin-bottom: 20px;  
            border-radius: 0 8px 8px 0;  
        }  
        .insight-card h3 { color: var(--primary-color); margin-top: 0; font-size: 1.3em;}  
        .week-protocol {  
            background-color: \#fdfdfd;  
            border: 1px solid var(--border-color);  
            padding: 25px;  
            border-radius: 10px;  
            margin-bottom: 25px;  
        }  
        .week-protocol h3 { color: var(--heading-color); margin-top: 0; font-size: 1.6em; }  
        .protocol-section h4 { margin: 20px 0 10px 0; color: var(--secondary-color); font-size: 1.2em; font-weight: 700; border-bottom: 1px dashed \#e0e0e0; padding-bottom: 5px; }  
        .protocol-section ul { list-style: none; padding: 0; }  
        .protocol-section li { margin-bottom: 8px; padding-left: 25px; position: relative; }  
        .protocol-section li::before { content: '✓'; position: absolute; left: 0; color: var(--accent-color); font-weight: bold; }

        .cta-section { text-align: center; background-color: var(--light-bg); padding: 30px; border-radius: 12px; margin-top: 40px; border: 1px solid var(--border-color); }  
        .cta-section h2 { font-size: 2em; color: var(--heading-color); border-bottom: none; padding-bottom: 0; margin-top: 0; }  
        .cta-section p { font-size: 1.1em; color: \#555; max-width: 600px; margin: 15px auto 25px auto; }  
        .cta-button { background-color: var(--secondary-color); color: white; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 1.2em; font-weight: 700; display: inline-block; transition: background-color 0.3s ease, transform 0.2s ease; }  
        .cta-button:hover { background-color: \#45a049; transform: translateY(-2px); }

    \</style\>  
\</head\>  
\<body\>

\<div class="container"\>  
    \<form id="intakeForm"\>  
        \<h1\>Your Intelligent Metabolic Protocol Generator\</h1\>  
        \<p style="text-align:center; margin-bottom: 30px;"\>Complete this detailed clinical assessment to generate your personalized 90-day healing roadmap.\</p\>  
          
        \<\!-- Step 1: Goal \--\>  
        \<div id="step1" class="form-step active"\>  
            \<h2\>Step 1: Your Primary Goal & Motivation\</h2\>  
            \<div class="form-group"\>  
                \<label for="primaryGoal"\>What is your \#1 health goal right now?\</label\>  
                \<select id="primaryGoal" name="primaryGoal"\>\</select\>  
            \</div\>  
            \<div class="form-group"\>  
                \<label for="why"\>My Personal "Why" (This is your deep motivation\!)\</label\>  
                \<textarea id="why" name="why" rows="4" placeholder="e.g., 'I want to have the energy to play with my kids.'"\>\</textarea\>  
            \</div\>  
            \<div class="navigation-buttons"\>\<span\>\</span\>\<button type="button" onclick="nextStep(2)"\>Next\</button\>\</div\>  
        \</div\>  
          
        \<\!-- Step 2: Symptoms \--\>  
        \<div id="step2" class="form-step"\>  
            \<h2\>Step 2: Core Metabolic & Hormonal Symptoms\</h2\>  
            \<p\>Check all symptoms you experience regularly. This helps us personalize your protocol.\</p\>  
            \<div id="symptoms-group"\>\</div\>  
            \<div class="navigation-buttons"\>\<button type="button" class="prev" onclick="prevStep(1)"\>Back\</button\>\<button type="button" onclick="nextStep(3)"\>Next\</button\>\</div\>  
        \</div\>

        \<\!-- Step 3: Labs & Medications \--\>  
        \<div id="step3" class="form-step"\>  
            \<h2\>Step 3: Lab Values & Medications (Optional)\</h2\>  
            \<h3\>Your Lab Values\</h3\>  
            \<div class="form-group"\>  
                \<label for="fastingGlucose"\>Fasting Glucose (mg/dL)\</label\>  
                \<input type="number" id="fastingGlucose" name="fastingGlucose"\>  
            \</div\>  
            \<div class="form-group"\>  
                \<label for="hba1c"\>HbA1c (%)\</label\>  
                \<input type="number" step="0.1" id="hba1c" name="hba1c"\>  
            \</div\>  
             \<div class="form-group"\>  
                \<label for="triglycerides"\>Triglycerides (mg/dL)\</label\>  
                \<input type="number" id="triglycerides" name="triglycerides"\>  
            \</div\>  
            \<div class="form-group"\>  
                \<label for="hdl"\>HDL Cholesterol (mg/dL)\</label\>  
                \<input type="number" id="hdl" name="hdl"\>  
            \</div\>  
            \<h3\>Current Medications\</h3\>  
            \<div class="checkbox-group" id="medications-group"\>\</div\>  
            \<div class="navigation-buttons"\>\<button type="button" class="prev" onclick="prevStep(2)"\>Back\</button\>\<button type="submit" id="generateButton"\>Generate My Roadmap\!\</button\>\</div\>  
        \</div\>  
    \</form\>

    \<div id="resultsPage"\>  
        \<div class="results-header"\>\<h1\>Your Personalized 90-Day Metabolic Reset\</h1\>\</div\>  
        \<div id="roadmapContainer"\>\</div\>  
    \</div\>  
\</div\>

\<script\>  
// \--- DATA DEFINITIONS \---  
const SYMPTOMS\_DATA \= \[  
    { id: 'ir\_fatigue\_after\_meals', label: 'Fatigue After Meals', category: 'Blood Sugar' }, { id: 'ir\_cravings', label: 'Sugar & Carb Cravings', category: 'Blood Sugar' }, { id: 'ir\_belly\_fat', label: 'Stubborn Belly Fat', category: 'Blood Sugar' },  
    { id: 'pcos\_irregular\_cycles', label: 'Irregular or Absent Cycles', category: 'PCOS & Hormonal' }, { id: 'pcos\_acne', label: 'Hormonal Acne (Jawline)', category: 'PCOS & Hormonal' }, { id: 'pcos\_hirsutism', label: 'Unwanted Hair Growth', category: 'PCOS & Hormonal' },  
    { id: 'digestive\_issues\_reflux', label: 'Acid Reflux / GERD', category: 'Inflammatory & Digestive' }, { id: 'digestive\_issues\_bloating', label: 'Bloating & Gas', category: 'Inflammatory & Digestive' }, { id: 'joint\_pain', label: 'Joint Pain & Stiffness', category: 'Inflammatory & Digestive' },  
    { id: 'poor\_sleep', label: 'Difficulty Falling/Staying Asleep', category: 'Energy & Cognitive' }, { id: 'brain\_fog', label: 'Brain Fog / Difficulty Concentrating', category: 'Energy & Cognitive' }, { id: 'general\_fatigue', label: 'General, Persistent Fatigue', category: 'Energy & Cognitive' }  
\];  
const MEDICATIONS\_DATA \= \[ { id: 'metformin', label: 'Metformin' }, { id: 'spironolactone', label: 'Spironolactone' }, { id: 'statins', label: 'Statin (e.g., Lipitor, Crestor)' }, { id: 'oral\_contraceptives', label: 'Oral Contraceptive (Birth Control)' }, { id: 'thyroid\_meds', label: 'Thyroid Medication (e.g., Levothyroxine)' }, { id: 'ppis', label: 'Acid Reducer / PPI (e.g., Omeprazole)'} \];  
const GOALS\_DATA \= \[ { value: 'weight\_loss', label: 'Sustainable Weight Loss' }, { value: 'regulate\_cycle', label: 'Regulate My Menstrual Cycle & Hormones' }, { value: 'increase\_energy', label: 'Increase Energy & End Afternoon Crashes' }, { value: 'reverse\_prediabetes', label: 'Improve My Blood Sugar & Reverse Prediabetes' }, { value: 'reduce\_inflammation', label: 'Reduce Inflammation, Bloating & Joint Pain' } \];

// \--- DYNAMIC POPULATION \---  
function populateCheckboxes(containerId, dataArray, name) {  
    const container \= document.getElementById(containerId);  
    const grouped \= dataArray.reduce((acc, item) \=\> {  
        acc\[item.category\] \= acc\[item.category\] || \[\];  
        acc\[item.category\].push(item);  
        return acc;  
    }, {});

    for (const category in grouped) {  
        container.innerHTML \+= \`\<div class="symptom-category"\>\<h4\>${category}\</h4\>\<div class="checkbox-group"\>\</div\>\</div\>\`;  
        const categoryDiv \= container.querySelector('.symptom-category:last-child .checkbox-group');  
        grouped\[category\].forEach(item \=\> {  
            categoryDiv.innerHTML \+= \`\<label\>\<input type="checkbox" name="${name}" value="${item.id}"\>${item.label}\</label\>\`;  
        });  
    }  
}  
populateCheckboxes('symptoms-group', SYMPTOMS\_DATA, 'symptoms');  
const medContainer \= document.getElementById('medications-group');  
MEDICATIONS\_DATA.forEach(item \=\> { medContainer.innerHTML \+= \`\<label\>\<input type="checkbox" name="medications" value="${item.id}"\>${item.label}\</label\>\`; });

function populateSelect(selectId, dataArray) {  
    const select \= document.getElementById(selectId);  
    select.innerHTML \= '\<option value=""\>-- Select \--\</option\>';  
    dataArray.forEach(item \=\> { select.innerHTML \+= \`\<option value="${item.value}"\>${item.label}\</option\>\`; });  
}  
populateSelect('primaryGoal', GOALS\_DATA);

// \--- FORM NAVIGATION \---  
let currentStep \= 1;  
function showStep(step) {  
    document.querySelectorAll('.form-step').forEach(el \=\> el.classList.remove('active'));  
    document.getElementById(\`step${step}\`).classList.add('active');  
    currentStep \= step;  
}  
function nextStep(step) { showStep(step); }  
function prevStep(step) { showStep(step); }

// \--- AI LOGIC ENGINE \---  
document.getElementById('intakeForm').addEventListener('submit', (event) \=\> {  
    event.preventDefault();  
    const formData \= new FormData(event.target);  
    const inputs \= {  
        symptoms: formData.getAll('symptoms'),  
        medications: formData.getAll('medications'),  
        labValues: { fastingGlucose: formData.get('fastingGlucose'), hba1c: formData.get('hba1c'), triglycerides: formData.get('triglycerides'), hdl: formData.get('hdl') },  
        primaryGoal: formData.get('primaryGoal'),  
        why: formData.get('why'),  
    };  
      
    const { blueprint, blueprintDescription } \= determineMetabolicBlueprint(inputs);  
    const insights \= generateInsights(inputs, blueprint);  
    const weeklyProtocols \= generateWeeklyProtocols(inputs);  
    const roadmapHTML \= buildProtocolHTML(inputs, blueprint, blueprintDescription, insights, weeklyProtocols);

    document.getElementById('intakeForm').style.display \= 'none';  
    document.getElementById('resultsPage').style.display \= 'block';  
    document.getElementById('roadmapContainer').innerHTML \= roadmapHTML;  
});

function determineMetabolicBlueprint(inputs) {  
    let sugarBurnerScore \= 0;  
    let hormonalStressScore \= 0;

    // Check for blood sugar related symptoms  
    if (inputs.symptoms.includes('ir\_fatigue\_after\_meals')) sugarBurnerScore \+= 1;  
    if (inputs.symptoms.includes('ir\_cravings')) sugarBurnerScore \+= 1;  
    if (inputs.symptoms.includes('ir\_belly\_fat')) sugarBurnerScore \+= 1;

    // Check for PCOS/hormonal symptoms  
    if (inputs.symptoms.includes('pcos\_irregular\_cycles')) hormonalStressScore \+= 2;  
    if (inputs.symptoms.includes('pcos\_acne')) hormonalStressScore \+= 1;  
    if (inputs.symptoms.includes('pcos\_hirsutism')) hormonalStressScore \+= 1;

    // Check for inflammatory symptoms  
    if (inputs.symptoms.includes('digestive\_issues\_bloating') || inputs.symptoms.includes('joint\_pain')) {  
        sugarBurnerScore \+= 0.5;  
        hormonalStressScore \+= 0.5;  
    }

    if (hormonalStressScore \> sugarBurnerScore && hormonalStressScore \>= 2\) {  
        return {   
            blueprint: 'Hormonally Stressed',  
            blueprintDescription: 'Your primary pattern suggests that hormonal imbalances, likely driven by stress and insulin, are a key area of focus. Your roadmap will prioritize hormone-balancing strategies.'  
        };  
    } else if (sugarBurnerScore \> 0\) {  
        return {   
            blueprint: 'Classic Sugar Burner',  
            blueprintDescription: 'Your primary pattern points towards blood sugar instability and insulin resistance. Your roadmap is designed to help you tame inflammation and master blood sugar control first.'  
        };  
    } else {  
        return {   
            blueprint: 'Metabolically Balanced',  
            blueprintDescription: 'Your pattern suggests a solid metabolic foundation. Your roadmap will focus on optimizing your health for longevity and resilience against future stressors.'  
        };  
    }  
}

function generateInsights(inputs, blueprint) {  
    const insights \= \[\];  
    const getSymptomLabel \= (id) \=\> SYMPTOMS\_DATA.find(s \=\> s.id \=== id)?.label || id;  
      
    if (inputs.symptoms.includes('pcos\_irregular\_cycles') || inputs.symptoms.includes('pcos\_acne')) {  
        insights.push({ title: "Insight on Your Hormonal Symptoms", text: \`You indicated symptoms like \<strong\>${getSymptomLabel('pcos\_acne')} and/or ${getSymptomLabel('pcos\_irregular\_cycles')}\</strong\>. This confirms that a focus on hormonal balance, as highlighted by your '${blueprint}' profile, is a critical part of your healing journey.\` });  
    }  
    const tg \= parseFloat(inputs.labValues.triglycerides);  
    const hdl \= parseFloat(inputs.labValues.hdl);  
    if(tg && hdl && (tg / hdl \> 2.5)) {  
        insights.push({ title: "Insight From Your Lab Values", text: \`Your Triglyceride/HDL ratio is \<strong\>${(tg/hdl).toFixed(1)}\</strong\>. This is a powerful clinical indicator of insulin resistance and strongly aligns with your '${blueprint}' profile. Your protocol will directly target improving this key marker.\` });  
    }  
    if (inputs.medications.includes('metformin')) {  
        insights.push({ title: "Insight on Your Medication", text: \`You are taking \<strong\>Metformin\</strong\>. It's important to be aware that this medication can deplete Vitamin B12 over time. Your protocol includes a recommendation to discuss this with your doctor.\` });  
    }  
    return insights;  
}

function generateWeeklyProtocols(inputs) {  
    const weeklyProtocols \= Array.from({ length: 12 }, (\_, i) \=\> ({  
        week: i \+ 1, theme: \`Week ${i \+ 1}: Foundational Health\`,  
        nutrition: \[\], lifestyle: \[\], movement: \[\], supplements: \[\]  
    }));

    // Baseline curriculum  
    weeklyProtocols\[0\].theme \= "Taming Inflammation"; weeklyProtocols\[0\].nutrition.push("Eliminate added sugars and industrial seed oils (canola, soybean, etc.).");  
    weeklyProtocols\[1\].theme \= "Balancing Blood Sugar"; weeklyProtocols\[1\].nutrition.push("Build every meal around the 'PFF' principle: Protein, healthy Fat, and Fiber."); weeklyProtocols\[1\].movement.push("Take a 10-15 minute walk after your largest meal of the day.");  
    // ... Add all 12 weeks of baseline themes and content here...  
    weeklyProtocols\[2\].theme \= "Introducing Meal Timing"; weeklyProtocols\[2\].nutrition.push("Implement a 12-hour overnight fast.");  
    weeklyProtocols\[3\].theme \= "Gut Health & Fiber"; weeklyProtocols\[3\].nutrition.push("Incorporate one fermented food daily.");  
    weeklyProtocols\[4\].theme \= "Optimizing Sleep"; weeklyProtocols\[4\].lifestyle.push("Create a 'power-down' hour before bed with no screens.");  
    weeklyProtocols\[5\].theme \= "Managing Stress"; weeklyProtocols\[5\].lifestyle.push("Practice 5 minutes of box breathing daily.");  
    weeklyProtocols\[6\].theme \= "Metabolic Flexibility"; weeklyProtocols\[6\].nutrition.push("If comfortable, try a 14-hour fast 2-3 days this week.");  
    weeklyProtocols\[7\].theme \= "Hormonal Harmony"; weeklyProtocols\[7\].lifestyle.push("Review personal care products for endocrine disruptors.");  
    weeklyProtocols\[8\].theme \= "Building Strength"; weeklyProtocols\[8\].movement.push("Incorporate 2 days of resistance training this week.");  
    weeklyProtocols\[9\].theme \= "Mindful Eating"; weeklyProtocols\[9\].lifestyle.push("Practice eating one meal per day without distractions.");  
    weeklyProtocols\[10\].theme \= "Consolidating Habits"; weeklyProtocols\[10\].lifestyle.push("Review logs and identify your 'power habits'.");  
    weeklyProtocols\[11\].theme \= "Sustaining Your Success"; weeklyProtocols\[11\].nutrition.push("Create a go-to healthy meal plan for busy weeks.");

    // Dynamic modifications  
    if (inputs.symptoms.includes('pcos\_irregular\_cycles')) {  
        weeklyProtocols\[3\].supplements.push("Drink 1-2 cups of Spearmint Tea daily to support healthy androgen balance.");  
        weeklyProtocols\[5\].supplements.push("Discuss adding Myo-Inositol with your practitioner.");  
    }  
    if (inputs.medications.includes('metformin')) {  
        weeklyProtocols\[0\].supplements.push("\<strong\>Medication Note:\</strong\> Metformin can deplete Vitamin B12. Discuss supplementing with a quality B-Complex with your doctor.");  
    }  
    if (inputs.medications.includes('statins')) {  
        weeklyProtocols\[0\].supplements.push("\<strong\>Medication Note:\</strong\> Statin drugs can deplete CoQ10. Discuss this with your practitioner.");  
    }  
    return weeklyProtocols;  
}

function buildProtocolHTML(inputs, blueprint, blueprintDescription, insights, weeklyProtocols) {  
    let blueprintClass \= 'balanced';  
    if (blueprint \=== 'Classic Sugar Burner') blueprintClass \= 'sugar-burner';  
    if (blueprint \=== 'Hormonally Stressed') blueprintClass \= 'hormonally-stressed';

    let html \= \`  
        \<div class="roadmap-page"\>  
            \<div class="blueprint-card ${blueprintClass}"\>  
                \<h2\>Your Metabolic Blueprint Analysis\</h2\>  
                \<p\>Your unique inputs reveal a primary metabolic pattern. Your profile is:\</p\>  
                \<p class="profile-name"\>${blueprint}\</p\>  
                \<p\>${blueprintDescription}\</p\>  
            \</div\>  
            \<div class="insight-card"\>\<h3\>Your Personal "Why"\</h3\>\<p\>${inputs.why || "Your commitment to health is your motivation\!"}\</p\>\</div\>\`;  
      
    if (insights.length \> 0\) {  
        html \+= \`\<h2\>Your Personalized Insights\</h2\>\<p\>Based on your answers, we've identified these key areas for your focus:\</p\>\`;  
        insights.forEach(insight \=\> {  
            html \+= \`\<div class="insight-card"\>\<h3\>${insight.title}\</h3\>\<p\>${insight.text}\</p\>\</div\>\`;  
        });  
    }  
    html \+= \`\</div\>\`;

    weeklyProtocols.forEach(week \=\> {  
        html \+= \`  
            \<div class="roadmap-page weekly-protocol-detail"\>  
                \<h3\>Week ${week.week}: ${week.theme}\</h3\>  
                \<div class="protocol-section"\>\<h4\>Nutrition Focus\</h4\>\<ul\>${week.nutrition.map(item \=\> \`\<li\>${item}\</li\>\`).join('')}\</ul\>\</div\>  
                \<div class="protocol-section"\>\<h4\>Movement Focus\</h4\>\<ul\>${week.movement.map(item \=\> \`\<li\>${item}\</li\>\`).join('')}\</ul\>\</div\>  
                \<div class="protocol-section"\>\<h4\>Lifestyle Focus\</h4\>\<ul\>${week.lifestyle.map(item \=\> \`\<li\>${item}\</li\>\`).join('')}\</ul\>\</div\>  
                ${week.supplements.length \> 0 ? \`\<div class="protocol-section"\>\<h4\>Personalized Supplement Considerations\</h4\>\<ul\>${week.supplements.map(item \=\> \`\<li\>${item}\</li\>\`).join('')}\</ul\>\</div\>\` : ''}  
            \</div\>\`;  
    });  
      
    html \+= \`  
        \<div class="cta-section"\>  
            \<h2\>Ready to Implement Your Plan?\</h2\>  
            \<p\>This roadmap is your personalized guide to reclaiming your health. The next step is turning this knowledge into action with expert support and accountability.\</p\>  
            \<a href="https://huntersholistichealth.com/contact" class="cta-button" target="\_blank" rel="noopener noreferrer"\>Schedule Your Free Consultation\</a\>  
        \</div\>\`;

    return html;  
}  
\</script\>  
\</body\>  
\</html\>

Metabolic health dashboard: \<\!DOCTYPE html\>  
\<html lang="en"\>  
\<head\>  
    \<meta charset="UTF-8"\>  
    \<meta name="viewport" content="width=device-width, initial-scale=1.0"\>  
    \<title\>Metabolic Health Dashboard\</title\>  
    \<style\>  
        :root {  
            \--primary-color: \#007bff;  
            \--secondary-color: \#6c757d;  
            \--accent-color: \#28a745;  
            \--background-color: \#f8f9fa;  
            \--card-background: \#ffffff;  
            \--border-color: \#dee2e6;  
            \--text-color: \#343a40;  
            \--heading-color: \#212529;  
            \--shadow-light: rgba(0, 0, 0, 0.1);  
        }

        body {  
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;  
            margin: 0;  
            padding: 0;  
            box-sizing: border-box;  
            background-color: var(--background-color);  
            color: var(--text-color);  
            line-height: 1.6;  
        }

        .container {  
            max-width: 960px;  
            margin: 20px auto;  
            padding: 20px;  
            background-color: var(--card-background);  
            border-radius: 8px;  
            box-shadow: 0 4px 12px var(--shadow-light);  
        }

        h1, h2, h3 {  
            color: var(--heading-color);  
            margin-bottom: 1rem;  
        }

        h1 {  
            text-align: center;  
            color: var(--primary-color);  
            margin-bottom: 30px;  
        }

        .tab-nav {  
            display: flex;  
            flex-wrap: wrap;  
            justify-content: center;  
            margin-bottom: 20px;  
            border-bottom: 1px solid var(--border-color);  
        }

        .tab-link {  
            background-color: transparent;  
            border: none;  
            padding: 15px 20px;  
            cursor: pointer;  
            font-size: 1rem;  
            font-weight: 600;  
            color: var(--secondary-color);  
            transition: color 0.3s ease, border-bottom 0.3s ease;  
            border-bottom: 3px solid transparent;  
            white-space: nowrap; /\* Prevent tabs from wrapping in the middle of text \*/  
        }

        .tab-link:hover {  
            color: var(--primary-color);  
        }

        .tab-link.active {  
            color: var(--primary-color);  
            border-bottom: 3px solid var(--primary-color);  
        }

        .tab-content {  
            padding: 20px 0;  
            display: none;  
            animation: fadeIn 0.5s ease-in-out;  
        }

        @keyframes fadeIn {  
            from { opacity: 0; transform: translateY(10px); }  
            to { opacity: 1; transform: translateY(0); }  
        }

        .form-group {  
            margin-bottom: 1rem;  
            display: flex;  
            flex-direction: column;  
        }

        .form-group label {  
            margin-bottom: 0.5rem;  
            font-weight: 500;  
        }

        .form-group input\[type="number"\],  
        .form-group select {  
            padding: 10px;  
            border: 1px solid var(--border-color);  
            border-radius: 5px;  
            font-size: 1rem;  
            width: 100%;  
            box-sizing: border-box; /\* Ensure padding doesn't add to width \*/  
        }

        .form-group input\[type="radio"\] {  
            margin-right: 5px;  
        }

        .radio-group label {  
            margin-right: 15px;  
            display: inline-flex;  
            align-items: center;  
            font-weight: normal; /\* Override .form-group label for radios \*/  
        }

        button.calculate-btn {  
            background-color: var(--primary-color);  
            color: white;  
            padding: 12px 20px;  
            border: none;  
            border-radius: 5px;  
            cursor: pointer;  
            font-size: 1rem;  
            font-weight: 600;  
            transition: background-color 0.3s ease;  
            width: 100%;  
            margin-top: 1rem;  
        }

        button.calculate-btn:hover {  
            background-color: \#0056b3;  
        }

        .result {  
            margin-top: 20px;  
            padding: 15px;  
            background-color: var(--background-color);  
            border: 1px solid var(--border-color);  
            border-radius: 5px;  
            font-size: 1.1rem;  
            font-weight: 600;  
            color: var(--primary-color);  
        }

        .result p {  
            margin: 5px 0;  
        }

        .practitioner-note {  
            margin-top: 20px;  
            padding: 15px;  
            background-color: \#e9f7ef; /\* Light green \*/  
            border-left: 5px solid var(--accent-color);  
            border-radius: 5px;  
            font-style: italic;  
            color: \#218838; /\* Darker green \*/  
        }

        .interpretation-section {  
            margin-top: 20px;  
            padding: 15px;  
            background-color: \#fff3cd; /\* Light yellow \*/  
            border-left: 5px solid \#ffc107; /\* Orange \*/  
            border-radius: 5px;  
            color: \#856404; /\* Dark yellow \*/  
        }

        .interpretation-section p {  
            margin: 5px 0;  
        }

        .unit-toggle {  
            display: flex;  
            gap: 10px;  
            margin-bottom: 10px;  
        }

        .unit-toggle button {  
            background-color: var(--secondary-color);  
            color: white;  
            padding: 8px 15px;  
            border: none;  
            border-radius: 5px;  
            cursor: pointer;  
            font-size: 0.9rem;  
        }

        .unit-toggle button.active {  
            background-color: var(--primary-color);  
        }

        .input-group {  
            display: flex;  
            gap: 10px;  
            align-items: flex-end; /\* Aligns inputs at the bottom \*/  
        }

        .input-group .form-group {  
            flex: 1;  
            margin-bottom: 0; /\* Remove bottom margin from inner form-groups \*/  
        }

        .input-group span {  
            padding-bottom: 10px; /\* Align unit text with input field \*/  
            white-space: nowrap;  
        }

        /\* Responsive adjustments \*/  
        @media (max-width: 768px) {  
            .tab-nav {  
                flex-direction: column;  
                align-items: stretch;  
            }  
            .tab-link {  
                text-align: center;  
                border-bottom: 1px solid var(--border-color);  
            }  
            .tab-link.active {  
                border-bottom: 3px solid var(--primary-color);  
            }  
            .container {  
                margin: 10px;  
                padding: 15px;  
            }  
            .input-group {  
                flex-direction: column;  
                gap: 0;  
            }  
            .input-group span {  
                padding-bottom: 0;  
                margin-top: 5px;  
            }  
        }

        .footer-disclaimer {  
            text-align: center;  
            margin-top: 40px;  
            padding-top: 20px;  
            border-top: 1px solid var(--border-color);  
            font-size: 0.85rem;  
            color: var(--secondary-color);  
        }  
    \</style\>  
\</head\>  
\<body\>  
    \<div class="container"\>  
        \<h1\>Metabolic Health Dashboard\</h1\>

        \<div class="tab-nav"\>  
            \<button class="tab-link active" onclick="openTab(event, 'BMR\_TDEE')"\>BMR & TDEE\</button\>  
            \<button class="tab-link" onclick="openTab(event, 'Macros')"\>Macro Calculator\</button\>  
            \<button class="tab-link" onclick="openTab(event, 'HOMA\_IR')"\>HOMA-IR\</button\>  
            \<button class="tab-link" onclick="openTab(event, 'BodyMetrics')"\>Body Metrics\</button\>  
            \<button class="tab-link" onclick="openTab(event, 'DailyIntakeGoals')"\>Daily Intake Goals\</button\>  
        \</div\>

        \<div id="BMR\_TDEE" class="tab-content" style="display:block;"\>  
            \<h2\>Basal Metabolic Rate & Total Daily Energy Expenditure\</h2\>  
            \<div class="form-group"\>  
                \<label for="age"\>Age (years):\</label\>  
                \<input type="number" id="age" min="1" value="30"\>  
            \</div\>  
            \<div class="form-group"\>  
                \<label\>Gender:\</label\>  
                \<div class="radio-group"\>  
                    \<label\>\<input type="radio" name="gender" value="male" checked\> Male\</label\>  
                    \<label\>\<input type="radio" name="gender" value="female"\> Female\</label\>  
                \</div\>  
            \</div\>  
            \<div class="form-group"\>  
                \<label for="weight-lbs"\>Weight:\</label\>  
                \<div class="input-group"\>  
                    \<div class="form-group"\>  
                        \<input type="number" id="weight-lbs" placeholder="lbs" value="150" oninput="syncWeight('lbs')"\>  
                        \<span\>lbs\</span\>  
                    \</div\>  
                    \<div class="form-group"\>  
                        \<input type="number" id="weight-kg" placeholder="kg" value="68.04" oninput="syncWeight('kg')"\>  
                        \<span\>kg\</span\>  
                    \</div\>  
                \</div\>  
            \</div\>  
            \<div class="form-group"\>  
                \<label for="height-ft"\>Height:\</label\>  
                \<div class="input-group"\>  
                    \<div class="form-group"\>  
                        \<input type="number" id="height-ft" placeholder="ft" value="5" oninput="syncHeight('ft')"\>  
                        \<span\>ft\</span\>  
                    \</div\>  
                    \<div class="form-group"\>  
                        \<input type="number" id="height-in" placeholder="in" value="7" oninput="syncHeight('in')"\>  
                        \<span\>in\</span\>  
                    \</div\>  
                    \<div class="form-group"\>  
                        \<input type="number" id="height-cm" placeholder="cm" value="170.18" oninput="syncHeight('cm')"\>  
                        \<span\>cm\</span\>  
                    \</div\>  
                \</div\>  
            \</div\>  
            \<div class="form-group"\>  
                \<label for="activity-level"\>Activity Level:\</label\>  
                \<select id="activity-level"\>  
                    \<option value="1.2"\>Sedentary (little or no exercise)\</option\>  
                    \<option value="1.375"\>Lightly Active (light exercise/sports 1-3 days/week)\</option\>  
                    \<option value="1.55"\>Moderately Active (moderate exercise/sports 3-5 days/week)\</option\>  
                    \<option value="1.725"\>Very Active (hard exercise/sports 6-7 days a week)\</option\>  
                    \<option value="1.9"\>Extra Active (very hard exercise & physical job)\</option\>  
                \</select\>  
            \</div\>  
            \<button class="calculate-btn" onclick="calculateBMRandTDEE()"\>Calculate BMR & TDEE\</button\>  
            \<div id="bmr-tdee-result" class="result" style="display:none;"\>\</div\>  
            \<div class="practitioner-note"\>  
                \<p\>\<strong\>Practitioner's Note:\</strong\> Your TDEE is your estimated 'maintenance' calories. For fat loss, a gentle deficit of 250-500 calories below your TDEE is a sustainable starting point.\</p\>  
            \</div\>  
        \</div\>

        \<div id="Macros" class="tab-content"\>  
            \<h2\>Personalized Macronutrient Targets\</h2\>  
            \<div class="form-group"\>  
                \<label for="target-calories"\>Enter Your Target Daily Calories:\</label\>  
                \<input type="number" id="target-calories" min="1000" value="2000"\>  
                \<small\>Auto-populates from TDEE if calculated.\</small\>  
            \</div\>  
            \<div class="form-group"\>  
                \<label for="macro-goal"\>Choose Your Goal:\</label\>  
                \<select id="macro-goal"\>  
                    \<option value="weightLoss"\>Weight Loss (40% Protein, 40% Fat, 20% Carb)\</option\>  
                    \<option value="maintenance"\>Maintenance (30% Protein, 40% Fat, 30% Carb)\</option\>  
                    \<option value="muscleGain"\>Muscle Gain (40% Protein, 30% Fat, 30% Carb)\</option\>  
                \</select\>  
            \</div\>  
            \<button class="calculate-btn" onclick="calculateMacros()"\>Calculate Macros\</button\>  
            \<div id="macro-result" class="result" style="display:none;"\>\</div\>  
            \<div class="practitioner-note"\>  
                \<p\>\<strong\>Practitioner's Note:\</strong\> For PCOS and Insulin Resistance, the 'Weight Loss' setting is often the most effective starting point as it helps manage insulin response.\</p\>  
            \</div\>  
        \</div\>

        \<div id="HOMA\_IR" class="tab-content"\>  
            \<h2\>Homeostatic Model Assessment for Insulin Resistance\</h2\>  
            \<div class="form-group"\>  
                \<label for="fasting-insulin"\>Fasting Insulin (µU/mL or mU/L):\</label\>  
                \<input type="number" id="fasting-insulin" min="0.1" step="0.1" value="5"\>  
            \</div\>  
            \<div class="form-group"\>  
                \<label for="fasting-glucose"\>Fasting Glucose:\</label\>  
                \<div class="unit-toggle"\>  
                    \<button id="glucose-mgdl-btn" class="active" onclick="setGlucoseUnit('mg/dL')"\>mg/dL\</button\>  
                    \<button id="glucose-mmol-btn" onclick="setGlucoseUnit('mmol/L')"\>mmol/L\</button\>  
                \</div\>  
                \<input type="number" id="fasting-glucose" min="1" step="0.1" value="90"\>  
                \<small id="glucose-unit-display"\>Unit: mg/dL\</small\>  
            \</div\>  
            \<button class="calculate-btn" onclick="calculateHOMA\_IR()"\>Calculate HOMA-IR\</button\>  
            \<div id="homa-ir-result" class="result" style="display:none;"\>\</div\>  
            \<div class="interpretation-section" style="display:none;" id="homa-ir-interpretation"\>  
                \<h3\>Interpretation:\</h3\>  
                \<p\>\<strong\>Optimal Insulin Sensitivity:\</strong\> HOMA-IR \< 1.0\</p\>  
                \<p\>\<strong\>Early Insulin Resistance:\</strong\> HOMA-IR \> 1.9\</p\>  
                \<p\>\<strong\>Significant Insulin Resistance:\</strong\> HOMA-IR \> 2.9\</p\>  
            \</div\>  
            \<div class="practitioner-note"\>  
                \<p\>\<strong\>Practitioner's Note:\</strong\> This is a non-diagnostic educational tool. The HOMA-IR score is a powerful way to \<strong\>estimate\</strong\> your level of insulin resistance. It's an excellent number to track with your doctor to measure your progress over time.\</p\>  
            \</div\>  
        \</div\>

        \<div id="BodyMetrics" class="tab-content"\>  
            \<h2\>Key Body Composition Metrics\</h2\>

            \<h3\>BMI Calculator\</h3\>  
            \<div class="form-group"\>  
                \<label for="bmi-weight-lbs"\>Weight:\</label\>  
                \<div class="input-group"\>  
                    \<div class="form-group"\>  
                        \<input type="number" id="bmi-weight-lbs" placeholder="lbs" value="150" oninput="syncBMIWeight('lbs')"\>  
                        \<span\>lbs\</span\>  
                    \</div\>  
                    \<div class="form-group"\>  
                        \<input type="number" id="bmi-weight-kg" placeholder="kg" value="68.04" oninput="syncBMIWeight('kg')"\>  
                        \<span\>kg\</span\>  
                    \</div\>  
                \</div\>  
            \</div\>  
            \<div class="form-group"\>  
                \<label for="bmi-height-ft"\>Height:\</label\>  
                \<div class="input-group"\>  
                    \<div class="form-group"\>  
                        \<input type="number" id="bmi-height-ft" placeholder="ft" value="5" oninput="syncBMIHeight('ft')"\>  
                        \<span\>ft\</span\>  
                    \</div\>  
                    \<div class="form-group"\>  
                        \<input type="number" id="bmi-height-in" placeholder="in" value="7" oninput="syncBMIHeight('in')"\>  
                        \<span\>in\</span\>  
                    \</div\>  
                    \<div class="form-group"\>  
                        \<input type="number" id="bmi-height-cm" placeholder="cm" value="170.18" oninput="syncBMIHeight('cm')"\>  
                        \<span\>cm\</span\>  
                    \</div\>  
                \</div\>  
            \</div\>  
            \<button class="calculate-btn" onclick="calculateBMI()"\>Calculate BMI\</button\>  
            \<div id="bmi-result" class="result" style="display:none;"\>\</div\>  
            \<div class="practitioner-note"\>  
                \<p\>\<strong\>Note:\</strong\> BMI does not account for muscle mass and is a limited metric. Use it as a general guide only.\</p\>  
            \</div\>

            \<hr style="margin: 30px 0; border-color: var(--border-color);"\>

            \<h3\>Body Fat Percentage Calculator (U.S. Navy Method)\</h3\>  
            \<div class="form-group"\>  
                \<label\>Gender:\</label\>  
                \<div class="radio-group"\>  
                    \<label\>\<input type="radio" name="bfp-gender" value="male" checked onclick="toggleHipInput()"\> Male\</label\>  
                    \<label\>\<input type="radio" name="bfp-gender" value="female" onclick="toggleHipInput()"\> Female\</label\>  
                \</div\>  
            \</div\>  
            \<div class="form-group"\>  
                \<label for="bfp-height-in"\>Height (inches):\</label\>  
                \<input type="number" id="bfp-height-in" min="1" value="67"\>  
            \</div\>  
            \<div class="form-group"\>  
                \<label for="neck-circ"\>Neck Circumference (inches):\</label\>  
                \<input type="number" id="neck-circ" min="1" step="0.1" value="15"\>  
            \</div\>  
            \<div class="form-group"\>  
                \<label for="waist-circ"\>Waist Circumference (inches):\</label\>  
                \<input type="number" id="waist-circ" min="1" step="0.1" value="32"\>  
            \</div\>  
            \<div class="form-group" id="hip-circ-group" style="display:none;"\>  
                \<label for="hip-circ"\>Hip Circumference (inches):\</label\>  
                \<input type="number" id="hip-circ" min="1" step="0.1" value="38"\>  
            \</div\>  
            \<button class="calculate-btn" onclick="calculateBodyFatPercentage()"\>Calculate Body Fat %\</button\>  
            \<div id="bfp-result" class="result" style="display:none;"\>\</div\>

            \<hr style="margin: 30px 0; border-color: var(--border-color);"\>

            \<h3\>Waist-to-Height Ratio Calculator\</h3\>  
            \<div class="form-group"\>  
                \<label for="wthr-waist-cm"\>Waist Circumference (cm):\</label\>  
                \<input type="number" id="wthr-waist-cm" min="1" step="0.1" value="81.28"\>  
            \</div\>  
            \<div class="form-group"\>  
                \<label for="wthr-height-cm"\>Height (cm):\</label\>  
                \<input type="number" id="wthr-height-cm" min="1" step="0.1" value="170.18"\>  
            \</div\>  
            \<button class="calculate-btn" onclick="calculateWaistToHeightRatio()"\>Calculate Waist-to-Height Ratio\</button\>  
            \<div id="wthr-result" class="result" style="display:none;"\>\</div\>  
            \<div class="practitioner-note"\>  
                \<p\>\<strong\>Note:\</strong\> A ratio under 50% is generally considered healthy. This can be a more useful metric than BMI for assessing metabolic risk.\</p\>  
            \</div\>  
        \</div\>

        \<div id="DailyIntakeGoals" class="tab-content"\>  
            \<h2\>Protein, Carb, and Water Intake Estimators\</h2\>

            \<h3\>Protein Calculator\</h3\>  
            \<div class="form-group"\>  
                \<label for="protein-weight-lbs"\>Weight:\</label\>  
                \<div class="input-group"\>  
                    \<div class="form-group"\>  
                        \<input type="number" id="protein-weight-lbs" placeholder="lbs" value="150" oninput="syncProteinWeight('lbs')"\>  
                        \<span\>lbs\</span\>  
                    \</div\>  
                    \<div class="form-group"\>  
                        \<input type="number" id="protein-weight-kg" placeholder="kg" value="68.04" oninput="syncProteinWeight('kg')"\>  
                        \<span\>kg\</span\>  
                    \</div\>  
                \</div\>  
            \</div\>  
            \<div class="form-group"\>  
                \<label for="protein-goal"\>Protein Goal:\</label\>  
                \<select id="protein-goal"\>  
                    \<option value="sedentary"\>Sedentary (0.8g/kg)\</option\>  
                    \<option value="active-weightloss"\>Active/Weight Loss (1.2-1.6g/kg)\</option\>  
                    \<option value="muscle-building"\>Muscle Building (1.6-2.2g/kg)\</option\>  
                \</select\>  
            \</div\>  
            \<button class="calculate-btn" onclick="calculateProteinIntake()"\>Calculate Protein\</button\>  
            \<div id="protein-result" class="result" style="display:none;"\>\</div\>

            \<hr style="margin: 30px 0; border-color: var(--border-color);"\>

            \<h3\>Carbohydrate Calculator\</h3\>  
            \<div class="form-group"\>  
                \<label for="carb-target-calories"\>Target Daily Calories:\</label\>  
                \<input type="number" id="carb-target-calories" min="1000" value="2000"\>  
            \</div\>  
            \<div class="form-group"\>  
                \<label for="carb-approach"\>Carbohydrate Approach:\</label\>  
                \<select id="carb-approach"\>  
                    \<option value="liberal-low-carb"\>Liberal Low-Carb (100-150g/day)\</option\>  
                    \<option value="moderate"\>Moderate (50-100g/day)\</option\>  
                    \<option value="ketogenic"\>Ketogenic (\<50g/day)\</option\>  
                \</select\>  
            \</div\>  
            \<button class="calculate-btn" onclick="calculateCarbIntake()"\>Calculate Carbohydrates\</button\>  
            \<div id="carb-result" class="result" style="display:none;"\>\</div\>  
            \<div class="practitioner-note"\>  
                \<p\>\<strong\>Note:\</strong\> For managing PCOS and prediabetes, staying under 100g per day is often a beneficial goal.\</p\>  
            \</div\>

            \<hr style="margin: 30px 0; border-color: var(--border-color);"\>

            \<h3\>Water Intake Calculator\</h3\>  
            \<div class="form-group"\>  
                \<label for="water-weight-lbs"\>Weight:\</label\>  
                \<div class="input-group"\>  
                    \<div class="form-group"\>  
                        \<input type="number" id="water-weight-lbs" placeholder="lbs" value="150" oninput="syncWaterWeight('lbs')"\>  
                        \<span\>lbs\</span\>  
                    \</div\>  
                    \<div class="form-group"\>  
                        \<input type="number" id="water-weight-kg" placeholder="kg" value="68.04" oninput="syncWaterWeight('kg')"\>  
                        \<span\>kg\</span\>  
                    \</div\>  
                \</div\>  
            \</div\>  
            \<button class="calculate-btn" onclick="calculateWaterIntake()"\>Calculate Water Intake\</button\>  
            \<div id="water-result" class="result" style="display:none;"\>\</div\>  
        \</div\>

        \<footer class="footer-disclaimer"\>  
            \<p\>\<strong\>Disclaimer:\</strong\> All tools on this Metabolic Health Dashboard are for educational purposes only and do not constitute medical advice. Please consult with a healthcare professional for personalized medical guidance.\</p\>  
        \</footer\>  
    \</div\>

    \<script\>  
        // Global variable to store TDEE for auto-population  
        let currentTDEE \= 0;  
        let glucoseUnit \= 'mg/dL'; // Default glucose unit for HOMA-IR

        /\*\*  
         \* Opens the selected tab and hides others.  
         \* @param {Event} evt The click event.  
         \* @param {string} tabName The ID of the tab content to display.  
         \*/  
        function openTab(evt, tabName) {  
            const tabContents \= document.getElementsByClassName("tab-content");  
            for (let i \= 0; i \< tabContents.length; i++) {  
                tabContents\[i\].style.display \= "none";  
            }

            const tabLinks \= document.getElementsByClassName("tab-link");  
            for (let i \= 0; i \< tabLinks.length; i++) {  
                tabLinks\[i\].className \= tabLinks\[i\].className.replace(" active", "");  
            }

            document.getElementById(tabName).style.display \= "block";  
            evt.currentTarget.className \+= " active";  
        }

        // \--- Unit Synchronization Functions \---

        /\*\*  
         \* Syncs weight inputs between lbs and kg.  
         \* @param {string} unit The unit that was just updated ('lbs' or 'kg').  
         \*/  
        function syncWeight(unit) {  
            const weightLbsInput \= document.getElementById('weight-lbs');  
            const weightKgInput \= document.getElementById('weight-kg');

            if (unit \=== 'lbs' && weightLbsInput.value \!== '') {  
                const lbs \= parseFloat(weightLbsInput.value);  
                weightKgInput.value \= (lbs \* 0.453592).toFixed(2);  
            } else if (unit \=== 'kg' && weightKgInput.value \!== '') {  
                const kg \= parseFloat(weightKgInput.value);  
                weightLbsInput.value \= (kg / 0.453592).toFixed(2);  
            }  
        }

        /\*\*  
         \* Syncs height inputs between ft/in and cm.  
         \* @param {string} unit The unit that was just updated ('ft', 'in', or 'cm').  
         \*/  
        function syncHeight(unit) {  
            const heightFtInput \= document.getElementById('height-ft');  
            const heightInInput \= document.getElementById('height-in');  
            const heightCmInput \= document.getElementById('height-cm');

            if (unit \=== 'ft' || unit \=== 'in') {  
                const ft \= parseFloat(heightFtInput.value || 0);  
                const inches \= parseFloat(heightInInput.value || 0);  
                const totalInches \= (ft \* 12\) \+ inches;  
                heightCmInput.value \= (totalInches \* 2.54).toFixed(2);  
            } else if (unit \=== 'cm' && heightCmInput.value \!== '') {  
                const cm \= parseFloat(heightCmInput.value);  
                const totalInches \= cm / 2.54;  
                heightFtInput.value \= Math.floor(totalInches / 12);  
                heightInInput.value \= (totalInches % 12).toFixed(1);  
            }  
        }

        /\*\*  
         \* Syncs weight inputs for BMI between lbs and kg.  
         \* @param {string} unit The unit that was just updated ('lbs' or 'kg').  
         \*/  
        function syncBMIWeight(unit) {  
            const weightLbsInput \= document.getElementById('bmi-weight-lbs');  
            const weightKgInput \= document.getElementById('bmi-weight-kg');

            if (unit \=== 'lbs' && weightLbsInput.value \!== '') {  
                const lbs \= parseFloat(weightLbsInput.value);  
                weightKgInput.value \= (lbs \* 0.453592).toFixed(2);  
            } else if (unit \=== 'kg' && weightKgInput.value \!== '') {  
                const kg \= parseFloat(weightKgInput.value);  
                weightLbsInput.value \= (kg / 0.453592).toFixed(2);  
            }  
        }

        /\*\*  
         \* Syncs height inputs for BMI between ft/in and cm.  
         \* @param {string} unit The unit that was just updated ('ft', 'in', or 'cm').  
         \*/  
        function syncBMIHeight(unit) {  
            const heightFtInput \= document.getElementById('bmi-height-ft');  
            const heightInInput \= document.getElementById('bmi-height-in');  
            const heightCmInput \= document.getElementById('bmi-height-cm');

            if (unit \=== 'ft' || unit \=== 'in') {  
                const ft \= parseFloat(heightFtInput.value || 0);  
                const inches \= parseFloat(heightInInput.value || 0);  
                const totalInches \= (ft \* 12\) \+ inches;  
                heightCmInput.value \= (totalInches \* 2.54).toFixed(2);  
            } else if (unit \=== 'cm' && heightCmInput.value \!== '') {  
                const cm \= parseFloat(heightCmInput.value);  
                const totalInches \= cm / 2.54;  
                heightFtInput.value \= Math.floor(totalInches / 12);  
                heightInInput.value \= (totalInches % 12).toFixed(1);  
            }  
        }

         /\*\*  
         \* Syncs weight inputs for Protein Calculator between lbs and kg.  
         \* @param {string} unit The unit that was just updated ('lbs' or 'kg').  
         \*/  
         function syncProteinWeight(unit) {  
            const weightLbsInput \= document.getElementById('protein-weight-lbs');  
            const weightKgInput \= document.getElementById('protein-weight-kg');

            if (unit \=== 'lbs' && weightLbsInput.value \!== '') {  
                const lbs \= parseFloat(weightLbsInput.value);  
                weightKgInput.value \= (lbs \* 0.453592).toFixed(2);  
            } else if (unit \=== 'kg' && weightKgInput.value \!== '') {  
                const kg \= parseFloat(weightKgInput.value);  
                weightLbsInput.value \= (kg / 0.453592).toFixed(2);  
            }  
        }

         /\*\*  
         \* Syncs weight inputs for Water Intake Calculator between lbs and kg.  
         \* @param {string} unit The unit that was just updated ('lbs' or 'kg').  
         \*/  
         function syncWaterWeight(unit) {  
            const weightLbsInput \= document.getElementById('water-weight-lbs');  
            const weightKgInput \= document.getElementById('water-weight-kg');

            if (unit \=== 'lbs' && weightLbsInput.value \!== '') {  
                const lbs \= parseFloat(weightLbsInput.value);  
                weightKgInput.value \= (lbs \* 0.453592).toFixed(2);  
            } else if (unit \=== 'kg' && weightKgInput.value \!== '') {  
                const kg \= parseFloat(weightKgInput.value);  
                weightLbsInput.value \= (kg / 0.453592).toFixed(2);  
            }  
        }

        // \--- BMR & TDEE Calculator \---

        function calculateBMRandTDEE() {  
            const age \= parseFloat(document.getElementById('age').value);  
            const gender \= document.querySelector('input\[name="gender"\]:checked').value;  
            const weightKg \= parseFloat(document.getElementById('weight-kg').value);  
            const heightCm \= parseFloat(document.getElementById('height-cm').value);  
            const activityFactor \= parseFloat(document.getElementById('activity-level').value);

            if (isNaN(age) || isNaN(weightKg) || isNaN(heightCm)) {  
                alert('Please enter valid numbers for Age, Weight, and Height.');  
                return;  
            }

            let bmr;  
            if (gender \=== 'male') {  
                bmr \= (10 \* weightKg) \+ (6.25 \* heightCm) \- (5 \* age) \+ 5;  
            } else {  
                bmr \= (10 \* weightKg) \+ (6.25 \* heightCm) \- (5 \* age) \- 161;  
            }

            const tdee \= bmr \* activityFactor;  
            currentTDEE \= tdee; // Store TDEE for macro calculator

            const resultDiv \= document.getElementById('bmr-tdee-result');  
            resultDiv.innerHTML \= \`  
                \<p\>Your Basal Metabolic Rate (BMR) is \<strong\>${bmr.toFixed(0)}\</strong\> calories per day.\</p\>  
                \<p\>Your Estimated Total Daily Energy Expenditure (TDEE) is \<strong\>${tdee.toFixed(0)}\</strong\> calories per day.\</p\>  
            \`;  
            resultDiv.style.display \= 'block';

            // Auto-populate target calories in Macro Calculator  
            document.getElementById('target-calories').value \= tdee.toFixed(0);  
        }

        // \--- Macro Calculator \---

        function calculateMacros() {  
            const targetCalories \= parseFloat(document.getElementById('target-calories').value);  
            const macroGoal \= document.getElementById('macro-goal').value;

            if (isNaN(targetCalories) || targetCalories \<= 0\) {  
                alert('Please enter a valid target daily calorie amount.');  
                return;  
            }

            let proteinPct, fatPct, carbPct;

            switch (macroGoal) {  
                case 'weightLoss':  
                    proteinPct \= 0.40; // 40% Protein  
                    fatPct \= 0.40;     // 40% Fat  
                    carbPct \= 0.20;    // 20% Carb  
                    break;  
                case 'maintenance':  
                    proteinPct \= 0.30; // 30% Protein  
                    fatPct \= 0.40;     // 40% Fat  
                    carbPct \= 0.30;    // 30% Carb  
                    break;  
                case 'muscleGain':  
                    proteinPct \= 0.40; // 40% Protein  
                    fatPct \= 0.30;     // 30% Fat  
                    carbPct \= 0.30;    // 30% Carb  
                    break;  
            }

            const proteinGrams \= (targetCalories \* proteinPct) / 4;  
            const fatGrams \= (targetCalories \* fatPct) / 9;  
            const carbGrams \= (targetCalories \* carbPct) / 4;

            const resultDiv \= document.getElementById('macro-result');  
            resultDiv.innerHTML \= \`  
                \<p\>Protein: \<strong\>${proteinGrams.toFixed(1)}g\</strong\>\</p\>  
                \<p\>Carbohydrates: \<strong\>${carbGrams.toFixed(1)}g\</strong\>\</p\>  
                \<p\>Fats: \<strong\>${fatGrams.toFixed(1)}g\</strong\>\</p\>  
            \`;  
            resultDiv.style.display \= 'block';  
        }

        // \--- HOMA-IR Calculator \---

        function setGlucoseUnit(unit) {  
            glucoseUnit \= unit;  
            document.getElementById('glucose-unit-display').textContent \= \`Unit: ${unit}\`;  
            document.getElementById('glucose-mgdl-btn').classList.toggle('active', unit \=== 'mg/dL');  
            document.getElementById('glucose-mmol-btn').classList.toggle('active', unit \=== 'mmol/L');  
        }

        function calculateHOMA\_IR() {  
            const fastingInsulin \= parseFloat(document.getElementById('fasting-insulin').value);  
            let fastingGlucose \= parseFloat(document.getElementById('fasting-glucose').value);

            if (isNaN(fastingInsulin) || isNaN(fastingGlucose) || fastingInsulin \<= 0 || fastingGlucose \<= 0\) {  
                alert('Please enter valid positive numbers for Fasting Insulin and Fasting Glucose.');  
                return;  
            }

            let homaIR;  
            if (glucoseUnit \=== 'mg/dL') {  
                homaIR \= (fastingInsulin \* fastingGlucose) / 405;  
            } else { // mmol/L  
                homaIR \= (fastingInsulin \* fastingGlucose) / 22.5;  
            }

            const resultDiv \= document.getElementById('homa-ir-result');  
            resultDiv.innerHTML \= \`\<p\>Your HOMA-IR Score is: \<strong\>${homaIR.toFixed(2)}\</strong\>\</p\>\`;  
            resultDiv.style.display \= 'block';  
            document.getElementById('homa-ir-interpretation').style.display \= 'block';  
        }

        // \--- Body Composition Calculators \---

        function calculateBMI() {  
            const weightKg \= parseFloat(document.getElementById('bmi-weight-kg').value);  
            const heightCm \= parseFloat(document.getElementById('bmi-height-cm').value);

            if (isNaN(weightKg) || isNaN(heightCm) || weightKg \<= 0 || heightCm \<= 0\) {  
                alert('Please enter valid positive numbers for Weight and Height for BMI.');  
                return;  
            }

            const heightM \= heightCm / 100;  
            const bmi \= weightKg / (heightM \* heightM);

            let category;  
            if (bmi \< 18.5) {  
                category \= "Underweight";  
            } else if (bmi \>= 18.5 && bmi \<= 24.9) {  
                category \= "Normal Weight";  
            } else if (bmi \>= 25 && bmi \<= 29.9) {  
                category \= "Overweight";  
            } else {  
                category \= "Obese";  
            }

            const resultDiv \= document.getElementById('bmi-result');  
            resultDiv.innerHTML \= \`  
                \<p\>Your BMI is: \<strong\>${bmi.toFixed(2)}\</strong\>\</p\>  
                \<p\>Category: \<strong\>${category}\</strong\>\</p\>  
            \`;  
            resultDiv.style.display \= 'block';  
        }

        function toggleHipInput() {  
            const gender \= document.querySelector('input\[name="bfp-gender"\]:checked').value;  
            const hipCircGroup \= document.getElementById('hip-circ-group');  
            if (gender \=== 'female') {  
                hipCircGroup.style.display \= 'flex'; // Use flex to maintain form-group styling  
            } else {  
                hipCircGroup.style.display \= 'none';  
            }  
        }

        function calculateBodyFatPercentage() {  
            const gender \= document.querySelector('input\[name="bfp-gender"\]:checked').value;  
            const heightIn \= parseFloat(document.getElementById('bfp-height-in').value);  
            const neckCirc \= parseFloat(document.getElementById('neck-circ').value);  
            const waistCirc \= parseFloat(document.getElementById('waist-circ').value);  
            let hipCirc \= 0;

            if (gender \=== 'female') {  
                hipCirc \= parseFloat(document.getElementById('hip-circ').value);  
                if (isNaN(hipCirc) || hipCirc \<= 0\) {  
                    alert('Please enter a valid Hip Circumference for females.');  
                    return;  
                }  
            }

            if (isNaN(heightIn) || isNaN(neckCirc) || isNaN(waistCirc) || heightIn \<= 0 || neckCirc \<= 0 || waistCirc \<= 0\) {  
                alert('Please enter valid positive numbers for Height, Neck, and Waist Circumferences.');  
                return;  
            }

            let bfp; // Body Fat Percentage  
            if (gender \=== 'male') {  
                // Men: 495 / (1.0324 \- 0.19077 \* log10(waist \- neck) \+ 0.15456 \* log10(height)) \- 450  
                bfp \= 495 / (1.0324 \- 0.19077 \* Math.log10(waistCirc \- neckCirc) \+ 0.15456 \* Math.log10(heightIn)) \- 450;  
            } else { // Female  
                // Women: 495 / (1.29579 \- 0.35004 \* log10(waist \+ hip \- neck) \+ 0.22100 \* log10(height)) \- 450  
                bfp \= 495 / (1.29579 \- 0.35004 \* Math.log10(waistCirc \+ hipCirc \- neckCirc) \+ 0.22100 \* Math.log10(heightIn)) \- 450;  
            }

            if (isNaN(bfp)) {  
                 alert('Calculation error. Please ensure your measurements are realistic (e.g., waist \> neck for men, waist \+ hip \> neck for women).');  
                 return;  
            }

            const resultDiv \= document.getElementById('bfp-result');  
            resultDiv.innerHTML \= \`\<p\>Estimated Body Fat Percentage: \<strong\>${bfp.toFixed(2)}%\</strong\>\</p\>\`;  
            resultDiv.style.display \= 'block';  
        }

        function calculateWaistToHeightRatio() {  
            const waistCm \= parseFloat(document.getElementById('wthr-waist-cm').value);  
            const heightCm \= parseFloat(document.getElementById('wthr-height-cm').value);

            if (isNaN(waistCm) || isNaN(heightCm) || waistCm \<= 0 || heightCm \<= 0\) {  
                alert('Please enter valid positive numbers for Waist and Height for Waist-to-Height Ratio.');  
                return;  
            }

            const wthr \= (waistCm / heightCm) \* 100;

            const resultDiv \= document.getElementById('wthr-result');  
            resultDiv.innerHTML \= \`\<p\>Your Waist-to-Height Ratio is: \<strong\>${wthr.toFixed(2)}%\</strong\>\</p\>\`;  
            resultDiv.style.display \= 'block';  
        }

        // \--- Intake Calculators \---

        function calculateProteinIntake() {  
            const weightKg \= parseFloat(document.getElementById('protein-weight-kg').value);  
            const proteinGoal \= document.getElementById('protein-goal').value;

            if (isNaN(weightKg) || weightKg \<= 0\) {  
                alert('Please enter a valid positive weight for protein calculation.');  
                return;  
            }

            let minProtein, maxProtein;  
            switch (proteinGoal) {  
                case 'sedentary':  
                    minProtein \= weightKg \* 0.8;  
                    maxProtein \= weightKg \* 0.8; // Same min/max for single value  
                    break;  
                case 'active-weightloss':  
                    minProtein \= weightKg \* 1.2;  
                    maxProtein \= weightKg \* 1.6;  
                    break;  
                case 'muscle-building':  
                    minProtein \= weightKg \* 1.6;  
                    maxProtein \= weightKg \* 2.2;  
                    break;  
            }

            const resultDiv \= document.getElementById('protein-result');  
            if (minProtein \=== maxProtein) {  
                resultDiv.innerHTML \= \`\<p\>Estimated Protein Intake: \<strong\>${minProtein.toFixed(1)}g\</strong\> per day\</p\>\`;  
            } else {  
                resultDiv.innerHTML \= \`\<p\>Estimated Protein Intake: \<strong\>${minProtein.toFixed(1)}g \- ${maxProtein.toFixed(1)}g\</strong\> per day\</p\>\`;  
            }  
            resultDiv.style.display \= 'block';  
        }

        function calculateCarbIntake() {  
            const carbApproach \= document.getElementById('carb-approach').value;  
            const targetCalories \= parseFloat(document.getElementById('carb-target-calories').value);

            if (isNaN(targetCalories) || targetCalories \<= 0\) {  
                alert('Please enter a valid target daily calorie amount for carbohydrate calculation.');  
                return;  
            }

            let carbMin, carbMax;  
            switch (carbApproach) {  
                case 'liberal-low-carb':  
                    carbMin \= 100;  
                    carbMax \= 150;  
                    break;  
                case 'moderate':  
                    carbMin \= 50;  
                    carbMax \= 100;  
                    break;  
                case 'ketogenic':  
                    carbMin \= 0; // Represents \< 50g  
                    carbMax \= 50;  
                    break;  
            }

            const resultDiv \= document.getElementById('carb-result');  
            if (carbMin \=== 0 && carbMax \=== 50\) {  
                resultDiv.innerHTML \= \`\<p\>Estimated Carbohydrate Intake: \<strong\>less than ${carbMax}g\</strong\> per day\</p\>\`;  
            } else {  
                resultDiv.innerHTML \= \`\<p\>Estimated Carbohydrate Intake: \<strong\>${carbMin}g \- ${carbMax}g\</strong\> per day\</p\>\`;  
            }  
            resultDiv.style.display \= 'block';  
        }

        function calculateWaterIntake() {  
            const weightLbs \= parseFloat(document.getElementById('water-weight-lbs').value);

            if (isNaN(weightLbs) || weightLbs \<= 0\) {  
                alert('Please enter a valid positive weight for water intake calculation.');  
                return;  
            }

            const ouncesPerDay \= weightLbs / 2;  
            const litersPerDay \= ouncesPerDay \* 0.0295735; // Convert ounces to liters

            const resultDiv \= document.getElementById('water-result');  
            resultDiv.innerHTML \= \`  
                \<p\>Estimated Water Intake: \<strong\>${ouncesPerDay.toFixed(0)} oz\</strong\> per day\</p\>  
                \<p\>(Approximately \<strong\>${litersPerDay.toFixed(1)} liters\</strong\> per day)\</p\>  
            \`;  
            resultDiv.style.display \= 'block';  
        }

        // Initial setup to display the first tab and hide hip input  
        document.addEventListener('DOMContentLoaded', () \=\> {  
            // Ensure initial sync for weight/height fields if values are pre-filled  
            syncWeight('lbs');  
            syncHeight('ft');  
            syncBMIWeight('lbs');  
            syncBMIHeight('ft');  
            syncProteinWeight('lbs');  
            syncWaterWeight('lbs');  
            toggleHipInput(); // Hide hip input initially for male default  
        });  
    \</script\>  
\</body\>  
\</html\>

This calculator provides estimates based on general formulas and should not replace professional medical advice. Individual metabolic rates vary significantly. Consult with a healthcare provider or registered dietitian before making significant dietary changes, especially if you have medical conditions like PCOS, diabetes, or thyroid disorders. Results are for educational purposes only.

The information provided on this website is for educational purposes only and is not intended as medical advice. The content has not been evaluated by the Food and Drug Administration and is not designed to diagnose, treat, cure, or prevent any disease. It should not replace the guidance of a physician or other healthcare professionals. We do not endorse self-management of health issues. Always consult your healthcare provider before making any decisions based on the information found here. Please note, this site is protected by reCAPTCHA, and Google's Privacy Policy and Terms of Service apply.

About

\<\!DOCTYPE html\>  
\<html lang="en"\>  
\<head\>  
    \<meta charset="UTF-8"\>  
    \<meta name="viewport" content="width=device-width, initial-scale=1.0"\>  
    \<title\>About Dr. Shallanda Hunter\</title\>  
    \<\!-- Chosen Palette: Serene Health \--\>  
    \<\!-- Application Structure Plan: A narrative-driven, single-column layout that guides the user through Dr. Hunter's personal and professional journey. The structure is chronological and thematic, starting with her identity, moving through her two major health challenges, explaining her framework, and ending with her mission. This linear flow is ideal for storytelling, building empathy and trust. Key results are highlighted in a visually distinct way to break up the text and emphasize success. \--\>  
    \<\!-- Visualization & Content Choices: The core of this page is textual narrative. The primary "visualization" is the use of typography, white space, and layout to make the story compelling. Key results from the ROOTS Framework are presented as a bulleted list with bolded timeframes to make them stand-all, scannable, and impactful. This choice is better than a chart because the data points are simple and part of a personal story, not a complex dataset. The goal is to inform and build a personal connection, which this structure achieves effectively. \--\>  
    \<\!-- CONFIRMATION: NO SVG graphics used. NO Mermaid JS used. \--\>  
    \<link rel="preconnect" href="https://fonts.googleapis.com"\>  
    \<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin\>  
    \<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800\&display=swap" rel="stylesheet"\>  
    \<script src="https://cdn.tailwindcss.com"\>\</script\>  
    \<style\>  
        body {  
            font-family: 'Inter', sans-serif;  
            background-color: \#f8fafc;  
            color: \#1f2937;  
        }  
        .highlight-blue {  
            color: \#2563eb;  
        }  
        .highlight-green {  
            color: \#16a34a;  
        }  
        .story-section {  
            border-left: 3px solid \#d1d5db;  
            padding-left: 1.5rem;  
            margin-bottom: 2rem;  
        }  
    \</style\>  
\</head\>  
\<body class="antialiased"\>

    \<main class="container mx-auto px-4 py-12 md:py-20 max-w-4xl"\>

        \<header class="text-center mb-12"\>  
            \<h1 class="4xl md:text-5xl font-extrabold mb-4"\>My Story & Mission\</h1\>  
            \<p class="text-lg text-gray-600"\>  
                Hi, I'm \<b class="highlight-blue"\>Dr. Shallanda Hunter\</b\>, a Doctor of Pharmacy, Certified Functional and Nutritional Medicine Practitioner, and a specialist in metabolic health. But more importantly, I'm someone who understands the confusion and frustration you might be feeling right now on a deeply personal level.  
            \</p\>  
            \<p class="mt-4 text-gray-600"\>My journey into this work wasn't just academic; it was born from my own \<b class="highlight-green"\>health crisis.\</b\>\</p\>  
        \</header\>

        \<article class="space-y-8 text-lg leading-relaxed text-gray-700"\>

            \<section class="story-section"\>  
                \<h2 class="text-2xl md:text-3xl font-bold mb-4"\>The Wake-Up Call: A Diagnosis I Never Expected\</h2\>  
                \<p\>  
                    At one point, despite my extensive background in pharmacy, I found myself sitting in a doctor's office listening to a word I never thought I'd hear applied to me: \<b class="font-semibold text-gray-800"\>prediabetes\</b\>. It was a shocking diagnosis that felt like a personal failure. How could I, a healthcare professional, be on the path to the very disease my own grandmother had?  
                \</p\>  
                \<p class="mt-4"\>  
                    That diagnosis became my turning point. I dove headfirst into the world of \<b class="font-semibold text-gray-800"\>functional medicine\</b\>, not just as a clinician, but as a patient. I devoured the research, applied the principles to my own life, and successfully reversed my prediabetes without medication. It was a profound victory, and it ignited my passion to help others do the same.  
                \</p\>  
            \</section\>

            \<section class="story-section"\>  
                \<h2 class="text-2xl md:text-3xl font-bold mb-4"\>The Second Challenge: Grief, Stress, and a Setback\</h2\>  
                \<p\>  
                    But the story doesn't end there. Life, as it often does, threw a devastating curveball. My mother was diagnosed with cancer, and my world stopped. I became her full-time caregiver, spending nearly every day in the stressful, sleep-deprived environment of a hospital until the day she passed. In the fog of grief that followed, I realized something alarming: the stress, the sleepless nights, and the emotional toll had taken a physical one. My old symptoms were back. The fatigue, the brain fog... and a quick check of my blood sugar confirmed it. The prediabetes had crept back in.  
                \</p\>  
                \<p class="mt-4"\>  
                    Not only that, but my hormones were in chaos. I developed painful, cystic-looking bumps along my chin—a classic sign of the hormonal imbalance often seen in conditions like PCOS.  
                \</p\>  
            \</section\>

            \<section class="story-section"\>  
                \<h2 class="text-2xl md:text-3xl font-bold mb-4"\>The ROOTS Framework: A Proven Way Out\</h2\>  
                \<p\>  
                    I was devastated, but I was also determined. I had the roadmap. I had the knowledge. This time, I knew exactly what to do. I implemented my own \<b class="font-semibold text-gray-800"\>ROOTS Framework\</b\> with fierce intention.  
                \</p\>  
                \<div class="mt-6 bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg"\>  
                    \<ul class="space-y-3"\>  
                        \<li class="flex items-start"\>  
                            \<span class="text-green-600 font-bold mr-3"\>✔\</span\>  
                            \<span\>\<b\>In two weeks\</b\>, my blood sugar levels were back in the normal zone.\</span\>  
                        \</li\>  
                        \<li class="flex items-start"\>  
                            \<span class="text-green-600 font-bold mr-3"\>✔\</span\>  
                            \<span\>By the third week, my fasting glucose was consistently in the 80s.\</span\>  
                        \</li\>  
                        \<li class="flex items-start"\>  
                            \<span class="text-green-600 font-bold mr-3"\>✔\</span\>  
                            \<span\>The painful bumps on my chin cleared completely within a month.\</span\>  
                        \</li\>  
                    \</ul\>  
                \</div\>  
                \<p class="mt-6"\>  
                    This second journey taught me the most important lesson of all: healing isn't a one-time event, and setbacks are not failures. It proved that having a powerful, reliable framework is the key to navigating life's inevitable stressors without letting them derail your health.  
                \</p\>  
            \</section\>

            \<section class="bg-blue-50 border-l-4 border-blue-500 p-8 rounded-r-lg mt-12"\>  
                \<h2 class="text-2xl md:text-3xl font-bold mb-4 text-center"\>My Mission: Your Path to Lasting Wellness\</h2\>  
                \<div class="text-center space-y-4"\>  
                    \<p\>  
                        This is why I do what I do. I don't just have the clinical knowledge as a Doctor of Pharmacy and functional medicine practitioner. I have the \<b class="font-semibold text-gray-800"\>lived experience\</b\>. I understand the shock of a diagnosis, the frustration of a setback, and the profound empowerment of taking back control.  
                    \</p\>  
                    \<p\>  
                        My mission is to give you the same framework and tools that I used for myself. To help you address the root causes of your condition, to show you how to balance your blood sugar and hormones, and to empower you to build a resilient foundation for lasting wellness.  
                    \</p\>  
                    \<p class="font-bold highlight-green text-xl mt-6"\>  
                        You are in the right place. Let's begin this journey together.  
                    \</p\>  
                \</div\>  
            \</section\>

        \</article\>

    \</main\>

\</body\>  
\</html\>

What is functional medicine

\<\!DOCTYPE html\>  
\<html lang="en"\>  
\<head\>  
    \<meta charset="UTF-8"\>  
    \<meta name="viewport" content="width=device-width, initial-scale=1.0"\>  
    \<title\>Functional Medicine\</title\>  
    \<\!-- Chosen Palette: Serene Green & Blue \--\>  
    \<\!-- Application Structure Plan: A single, informational page designed to educate the user about functional medicine. The structure is linear, starting with a general definition, then breaking down key differences, scientific foundations, and what to expect. The use of cards for the "Key Differences" list enhances visual hierarchy and scannability. This structure is chosen to guide the user through a logical progression of information without requiring complex interactions. \--\>  
    \<\!-- Visualization & Content Choices: Content is presented through a combination of headings, paragraphs, and lists. No complex data visualizations are needed. The "Key Differences" section uses a grid layout with card-like styling to visually differentiate each point, making the information more digestible. Icons and bolding are used for emphasis. \--\>  
    \<\!-- CONFIRMATION: NO SVG graphics used. NO Mermaid JS used. \--\>  
    \<link rel="preconnect" href="https://fonts.googleapis.com"\>  
    \<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin\>  
    \<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800\&display=swap" rel="stylesheet"\>  
    \<script src="https://cdn.tailwindcss.com"\>\</script\>  
    \<style\>  
        body {  
            font-family: 'Inter', sans-serif;  
            background-color: \#f0fdf4; /\* Lightest green \*/  
            color: \#1f2937;  
        }  
        .container {  
            max-width: 1200px;  
        }  
        .text-green-main {  
            color: \#10b981;  
        }  
        .text-blue-main {  
            color: \#2563eb;  
        }  
        .bg-green-soft {  
            background-color: \#d1fae5;  
        }  
        .bg-blue-soft {  
            background-color: \#dbeafe;  
        }  
    \</style\>  
\</head\>  
\<body class="antialiased"\>

    \<main class="container mx-auto px-4 py-12 md:py-24 max-w-5xl"\>  
          
        \<\!-- Functional Medicine Section \--\>  
        \<section\>  
            \<h1 class="text-4xl md:text-5xl font-extrabold text-center text-gray-900 mb-8"\>What Is Functional Medicine?\</h1\>  
            \<div class="text-lg text-gray-700 space-y-6"\>  
                \<p\>  
                    Functional medicine is a patient-centered, science-based approach to healthcare that focuses on identifying and addressing the root causes of disease. Unlike traditional medicine, which primarily manages symptoms, functional medicine seeks to understand why illness occurs and how to restore optimal health.  
                \</p\>  
                \<h2 class="text-2xl md:text-3xl font-bold text-gray-800"\>Key Differences Between Functional Medicine and Traditional Medicine:\</h2\>  
                  
                \<div class="grid md:grid-cols-2 gap-6"\>  
                    \<div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-main"\>  
                        \<h3 class="text-xl font-bold text-gray-800 mb-2"\>Root Cause Focus\</h3\>  
                        \<p class="text-gray-700"\>Functional medicine delves deeper to uncover the underlying factors contributing to disease, rather than simply suppressing symptoms.\</p\>  
                    \</div\>  
                    \<div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-main"\>  
                        \<h3 class="text-xl font-bold text-gray-800 mb-2"\>Patient-Centered\</h3\>  
                        \<p class="text-gray-700"\>Treatment plans are tailored to the individual's unique needs and circumstances, not just the disease label.\</p\>  
                    \</div\>  
                    \<div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-main"\>  
                        \<h3 class="text-xl font-bold text-gray-800 mb-2"\>Comprehensive Evaluation\</h3\>  
                        \<p class="text-gray-700"\>A holistic approach considers lifestyle, environment, genetics, and emotional well-being in addition to physical symptoms.\</p\>  
                    \</div\>  
                    \<div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-main"\>  
                        \<h3 class="text-xl font-bold text-gray-800 mb-2"\>Personalized Treatment\</h3\>  
                        \<p class="text-gray-700"\>Therapies may include nutrition, exercise, stress management, and targeted supplements, customized to the individual.\</p\>  
                    \</div\>  
                    \<div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-main md:col-span-2"\>  
                        \<h3 class="text-xl font-bold text-gray-800 mb-2"\>Prevention Focused\</h3\>  
                        \<p class="text-gray-700"\>Functional medicine emphasizes proactive measures to prevent disease and promote long-term wellness.\</p\>  
                    \</div\>  
                \</div\>

                \<h2 class="text-2xl md:text-3xl font-bold text-gray-800 mt-8"\>The Scientific Foundation of Functional Medicine:\</h2\>  
                \<p\>  
                    Functional medicine is grounded in scientific research and clinical evidence. It incorporates principles from systems biology, genomics, and environmental medicine to understand the complex interactions within the body and how they influence health.  
                \</p\>  
                  
                \<h2 class="text-2xl md:text-3xl font-bold text-gray-800 mt-8"\>What to Expect in a Functional Medicine Consultation:\</h2\>  
                \<p\>  
                    Expect a thorough review of your medical history, lifestyle habits, and environmental exposures. Your practitioner may also order specialized tests to assess nutrient levels, hormone balance, and other biomarkers. Together, you will develop a personalized plan to address the root causes of your health concerns.  
                \</p\>

                \<h2 class="text-2xl md:text-3xl font-bold text-gray-800 mt-8"\>Taking Charge of Your Health:\</h2\>  
                \<p\>  
                    Functional medicine empowers patients to take an active role in their health journey. By addressing the root causes of disease and promoting a personalized approach to wellness, functional medicine offers a promising path to optimal health and vitality.  
                \</p\>  
            \</div\>  
        \</section\>

        \<\!-- New Section: The Medicine of the Future \--\>  
        \<section class="mt-16 text-center"\>  
            \<h2 class="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4"\>Functional Medicine: The Medicine of the Future\</h2\>  
            \<p class="text-lg text-gray-700 max-w-4xl mx-auto"\>  
                In a world focused on quick fixes, functional medicine represents a fundamental shift towards sustainable, proactive health. By putting the patient at the center and using a scientific lens to explore the whole body, it provides a powerful framework for not just managing illness, but for creating a future of true wellness and resilience.  
            \</p\>  
        \</section\>

    \</main\>  
\</body\>  
\</html\>

Work with me: what you get   
\<\!DOCTYPE html\>  
\<html lang="en"\>  
\<head\>  
    \<meta charset="UTF-8"\>  
    \<meta name="viewport" content="width=device-width, initial-scale=1.0"\>  
    \<title\>The 90-Day Intensive\</title\>  
    \<\!-- Chosen Palette: Serene Green & Blue \--\>  
    \<\!-- Application Structure Plan: The page is structured as a long-scrolling sales funnel, starting with a powerful headline and hook, followed by a list of who the program is for, a detailed breakdown of the ROOTS Framework, an interactive month-by-month itinerary, a summary of expected transformations, and a clear call-to-action. The content is broken into distinct, thematic sections to improve readability and flow. The inclusion of a collapsible "What's Included" section is a key design choice to reduce visual clutter and allow users to explore details at their own pace. \--\>  
    \<\!-- Visualization & Content Choices: The content is primarily text-based, so visualization is handled through structured layout and typography. Lists use checkmark icons and bolding for emphasis. The ROOTS Framework and "What to Expect" sections use card-like layouts within a grid to make each point stand out. The "What's Included" section is an interactive element using vanilla JavaScript to toggle the visibility of content for each month, making the detailed itinerary less intimidating. No complex data visualizations are used as the content is narrative and list-based. \--\>  
    \<\!-- CONFIRMATION: NO SVG graphics used. NO Mermaid JS used. \--\>  
    \<link rel="preconnect" href="https://fonts.googleapis.com"\>  
    \<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin\>  
    \<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800\&display=swap" rel="stylesheet"\>  
    \<script src="https://cdn.tailwindcss.com"\>\</script\>  
    \<style\>  
        body {  
            font-family: 'Inter', sans-serif;  
            background-color: \#f0fdf4; /\* Lightest green \*/  
            color: \#1f2937;  
        }  
        .container {  
            max-width: 1200px;  
        }  
        .text-green-main {  
            color: \#10b981;  
        }  
        .text-blue-main {  
            color: \#2563eb;  
        }  
        .bg-green-soft {  
            background-color: \#d1fae5;  
        }  
        .bg-blue-soft {  
            background-color: \#dbeafe;  
        }  
    \</style\>  
\</head\>  
\<body class="antialiased"\>

    \<main class="container mx-auto px-4 py-12 md:py-24"\>  
          
        \<\!-- Opening Hook Section \--\>  
        \<section class="text-center mb-16 md:mb-24"\>  
            \<h1 class="text-4xl md:text-6xl font-extrabold leading-tight text-gray-900 mb-4"\>  
                The \<span class="text-green-main"\>90-Day Metabolic Reset Intensive\</span\>: A Personalized Path to Healing  
            \</h1\>  
            \<p class="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto"\>  
                Comprehensive 1-on-1 program for women ready to address the root causes of PCOS and prediabetes  
            \</p\>  
            \<div class="mt-8 md:mt-12 max-w-2xl mx-auto italic text-lg text-gray-600"\>  
                \<p\>  
                    For women who feel like they've tried everything—every diet, every supplement, every piece of advice from well-meaning friends and doctors—yet still wake up tired, struggle with stubborn weight, and feel betrayed by their own body.  
                \</p\>  
                \<p class="mt-4"\>  
                    If you're ready to stop managing symptoms and start healing the root causes, this intensive is designed for you.  
                \</p\>  
            \</div\>  
        \</section\>

        \<\!-- This Intensive Is For You If... Section \--\>  
        \<section class="mb-16 md:mb-24"\>  
            \<h2 class="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8"\>This Intensive Is For You If...\</h2\>  
            \<div class="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto text-lg text-gray-700"\>  
                \<div class="flex items-start p-4 bg-white rounded-xl shadow-sm"\>  
                    \<span class="text-green-main font-bold mt-1 mr-3"\>✓\</span\>  
                    \<span\>You've been diagnosed with PCOS, prediabetes, or both, and you're tired of being told to "just lose weight"\</span\>  
                \</div\>  
                \<div class="flex items-start p-4 bg-white rounded-xl shadow-sm"\>  
                    \<span class="text-green-main font-bold mt-1 mr-3"\>✓\</span\>  
                    \<span\>You're ready to invest seriously in your health and commit to a systematic approach\</span\>  
                \</div\>  
                \<div class="flex items-start p-4 bg-white rounded-xl shadow-sm"\>  
                    \<span class="text-green-main font-bold mt-1 mr-3"\>✓\</span\>  
                    \<span\>You want to understand \<b class="font-bold"\>WHY\</b\> your body is struggling, not just \<b class="font-bold"\>HOW\</b\> to manage it\</span\>  
                \</div\>  
                \<div class="flex items-start p-4 bg-white rounded-xl shadow-sm"\>  
                    \<span class="text-green-main font-bold mt-1 mr-3"\>✓\</span\>  
                    \<span\>You're seeking personalized guidance, not generic meal plans and workout routines\</span\>  
                \</div\>  
                \<div class="flex items-start p-4 bg-white rounded-xl shadow-sm"\>  
                    \<span class="text-green-main font-bold mt-1 mr-3"\>✓\</span\>  
                    \<span\>You're prepared to address lifestyle factors like stress, sleep, and mindset—not just diet and exercise\</span\>  
                \</div\>  
                \<div class="flex items-start p-4 bg-white rounded-xl shadow-sm"\>  
                    \<span class="text-green-main font-bold mt-1 mr-3"\>✓\</span\>  
                    \<span\>You want to work with someone who has walked this path personally and professionally\</span\>  
                \</div\>  
                \<div class="flex items-start p-4 bg-white rounded-xl shadow-sm md:col-span-2"\>  
                    \<span class="text-green-main font-bold mt-1 mr-3"\>✓\</span\>  
                    \<span\>You're ready to build sustainable habits that will serve you for life, not quick fixes\</span\>  
                \</div\>  
            \</div\>  
        \</section\>

        \<\!-- How It Works: The ROOTS Framework Section \--\>  
        \<section class="mb-16 md:mb-24 text-center"\>  
            \<h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4"\>How It Works: The \<span class="text-blue-main"\>ROOTS\</span\> Framework\</h2\>  
            \<p class="text-lg text-gray-600 mb-12"\>This isn't guesswork. The ROOTS Framework is a systematic, evidence-based approach that addresses the five key areas where metabolic dysfunction takes root:\</p\>  
              
            \<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto text-left"\>  
                \<div class="bg-white p-6 rounded-2xl shadow-xl border-t-4 border-blue-main hover:scale-105 transition-transform duration-300"\>  
                    \<h3 class="text-2xl font-extrabold text-blue-main mb-2"\>REVIEW your unique health landscape\</h3\>  
                    \<ul class="list-disc list-inside space-y-2 text-gray-700"\>  
                        \<li\>Comprehensive assessment of your health history, dietary habits, and lifestyle factors\</li\>  
                        \<li\>Advanced testing interpretation for blood sugar, inflammation, gut health, and hormonal balance\</li\>  
                        \<li\>Educational framework and options so you can choose strategies that align with your specific needs and goals\</li\>  
                    \</ul\>  
                \</div\>  
                \<div class="bg-white p-6 rounded-2xl shadow-xl border-t-4 border-green-main hover:scale-105 transition-transform duration-300"\>  
                    \<h3 class="text-2xl font-extrabold text-green-main mb-2"\>OPTIMIZE NUTRITION for metabolic balance\</h3\>  
                    \<ul class="list-disc list-inside space-y-2 text-gray-700"\>  
                        \<li\>Education on nutrient-dense meal planning focused on blood sugar stability\</li\>  
                        \<li\>Anti-inflammatory food strategies you can adapt to your body's unique responses\</li\>  
                        \<li\>Meal timing protocols you can implement based on your natural hormonal rhythms\</li\>  
                    \</ul\>  
                \</div\>  
                \<div class="bg-white p-6 rounded-2xl shadow-xl border-t-4 border-blue-main hover:scale-105 transition-transform duration-300"\>  
                    \<h3 class="text-2xl font-extrabold text-blue-main mb-2"\>OPTIMIZE BIOCHEMICAL BALANCE\</h3\>  
                    \<ul class="list-disc list-inside space-y-2 text-gray-700"\>  
                        \<li\>Education on targeted supplementation options based on your individual needs and medication interactions\</li\>  
                        \<li\>Gut health optimization protocols you can choose to implement\</li\>  
                        \<li\>Understanding nutrient depletions so you can address what may be impacting your metabolism\</li\>  
                    \</ul\>  
                \</div\>  
                \<div class="bg-white p-6 rounded-2xl shadow-xl border-t-4 border-green-main hover:scale-105 transition-transform duration-300"\>  
                    \<h3 class="text-2xl font-extrabold text-green-main mb-2"\>TRANSFORM LIFESTYLE factors that impact metabolism\</h3\>  
                    \<ul class="list-disc list-inside space-y-2 text-gray-700"\>  
                        \<li\>Stress management techniques you can adapt to your daily reality\</li\>  
                        \<li\>Sleep optimization strategies you can implement for hormone balance\</li\>  
                        \<li\>Sustainable movement practices you can choose based on your preferences and schedule\</li\>  
                    \</ul\>  
                \</div\>  
                \<div class="bg-white p-6 rounded-2xl shadow-xl border-t-4 border-blue-main hover:scale-105 transition-transform duration-300"\>  
                    \<h3 class="text-2xl font-extrabold text-blue-main mb-2"\>SUSTAIN & ADAPT for lifelong success\</h3\>  
                    \<ul class="list-disc list-inside space-y-2 text-gray-700"\>  
                        \<li\>Long-term maintenance strategies that evolve with your life\</li\>  
                        \<li\>Tools to become your own "health detective"\</li\>  
                        \<li\>Advocacy skills to navigate healthcare and social situations with confidence\</li\>  
                    \</ul\>  
                \</div\>  
            \</div\>  
        \</section\>

        \<\!-- What's Included Section \--\>  
        \<section class="mb-16 md:mb-24"\>  
            \<h2 class="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8"\>What's Included in Your 90-Day Intensive\</h2\>  
              
            \<div class="max-w-3xl mx-auto"\>  
                \<\!-- Month 1 \--\>  
                \<div class="bg-white rounded-xl shadow-xl p-6 mb-6 cursor-pointer" onclick="toggleDetails('month1')"\>  
                    \<div class="flex justify-between items-center"\>  
                        \<h3 class="text-2xl font-bold text-blue-main"\>Month 1: Foundation & Assessment (Weeks 1-4)\</h3\>  
                        \<span class="text-2xl text-blue-main"\>+\</span\>  
                    \</div\>  
                    \<div id="month1-details" class="hidden mt-4 text-gray-700 space-y-3"\>  
                        \<ul class="list-disc list-inside"\>  
                            \<li\>\<b\>Week 1:\</b\> 90-minute comprehensive health consultation & ROOTS Framework education \+ option mapping\</li\>  
                            \<li\>\<b\>Week 2:\</b\> Personalized lab review session (60 minutes) \+ nutrition protocol options you can choose from\</li\>  
                            \<li\>\<b\>Week 3:\</b\> First implementation check-in (45 minutes) \+ troubleshooting support\</li\>  
                            \<li\>\<b\>Week 4:\</b\> Progress assessment & your choice of protocol adjustments (45 minutes)\</li\>  
                        \</ul\>  
                        \<p\>\<b\>Support:\</b\> Daily text/email access for questions and adjustments\</p\>  
                    \</div\>  
                \</div\>

                \<\!-- Month 2 \--\>  
                \<div class="bg-white rounded-xl shadow-xl p-6 mb-6 cursor-pointer" onclick="toggleDetails('month2')"\>  
                    \<div class="flex justify-between items-center"\>  
                        \<h3 class="text-2xl font-bold text-blue-main"\>Month 2: Implementation & Optimization (Weeks 5-8)\</h3\>  
                        \<span class="text-2xl text-blue-main"\>+\</span\>  
                    \</div\>  
                    \<div id="month2-details" class="hidden mt-4 text-gray-700 space-y-3"\>  
                        \<ul class="list-disc list-inside"\>  
                            \<li\>\<b\>Weeks 5 & 7:\</b\> 60-minute deep-dive coaching sessions where you'll learn nutrition optimization and biochemical balance strategies to choose from\</li\>  
                            \<li\>\<b\>Weeks 6 & 8:\</b\> 30-minute check-in calls for real-time education and support as you make adjustments\</li\>  
                        \</ul\>  
                        \<p\>\<b\>Support:\</b\> Bi-weekly detailed progress reviews \+ ongoing messaging support\</p\>  
                    \</div\>  
                \</div\>

                \<\!-- Month 3 \--\>  
                \<div class="bg-white rounded-xl shadow-xl p-6 mb-6 cursor-pointer" onclick="toggleDetails('month3')"\>  
                    \<div class="flex justify-between items-center"\>  
                        \<h3 class="text-2xl font-bold text-blue-main"\>Month 3: Integration & Sustainability (Weeks 9-12)\</h3\>  
                        \<span class="text-2xl text-blue-main"\>+\</span\>  
                    \</div\>  
                    \<div id="month3-details" class="hidden mt-4 text-gray-700 space-y-3"\>  
                        \<ul class="list-disc list-inside"\>  
                            \<li\>\<b\>Weeks 9 & 11:\</b\> 60-minute sessions where you'll learn lifestyle transformation strategies and decide what habits to integrate\</li\>  
                            \<li\>\<b\>Weeks 10 & 12:\</b\> 45-minute sessions focused on your sustainability planning and graduation preparation choices\</li\>  
                        \</ul\>  
                        \<p\>\<b\>Support:\</b\> Weekly email summaries \+ priority messaging access\</p\>  
                    \</div\>  
                \</div\>

                \<\!-- Continuous Support & Bonuses \--\>  
                \<div class="mt-12 space-y-6"\>  
                    \<div class="p-6 bg-green-soft rounded-xl shadow-md border-l-4 border-green-main"\>  
                        \<h3 class="text-2xl font-bold text-green-main mb-3"\>Continuous Support Throughout:\</h3\>  
                        \<ul class="list-disc list-inside space-y-2 text-gray-700"\>  
                            \<li\>Access to private resource library and meal planning tools for your independent use\</li\>  
                            \<li\>Education on supplement options with medication interaction information\</li\>  
                            \<li\>Weekly progress tracking and educational support as you make plan adjustments\</li\>  
                            \<li\>Priority email/text support for questions as you implement your choices (response within 24 hours on weekdays)\</li\>  
                        \</ul\>  
                    \</div\>  
                    \<div class="p-6 bg-blue-soft rounded-xl shadow-md border-l-4 border-blue-main"\>  
                        \<h3 class="text-2xl font-bold text-blue-main mb-3"\>Founding Client Exclusive Bonuses:\</h3\>  
                        \<ul class="list-disc list-inside space-y-2 text-gray-700"\>  
                            \<li\>6-month post-program email support (valued at $1,200)\</li\>  
                            \<li\>Lifetime access to all future program updates and resources\</li\>  
                            \<li\>Priority booking for any additional sessions at founding client rates\</li\>  
                            \<li\>Monthly group Q\&A calls for 6 months post-graduation\</li\>  
                        \</ul\>  
                    \</div\>  
                \</div\>  
            \</div\>  
        \</section\>

        \<\!-- What You Can Expect Section \--\>  
        \<section class="mb-16 md:mb-24"\>  
            \<h2 class="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8"\>The Transformation: What You Can Expect\</h2\>  
            \<div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"\>  
                \<div class="bg-white p-6 rounded-2xl shadow-md border-t-4 border-green-main"\>  
                    \<h3 class="text-xl font-bold text-green-main mb-3"\>By Week 4:\</h3\>  
                    \<ul class="list-disc list-inside space-y-2 text-gray-700"\>  
                        \<li\>Improved energy levels and fewer afternoon crashes\</li\>  
                        \<li\>Better sleep quality and morning alertness\</li\>  
                        \<li\>Reduced bloating and digestive discomfort\</li\>  
                        \<li\>Clearer understanding of your body's unique needs\</li\>  
                    \</ul\>  
                \</div\>  
                \<div class="bg-white p-6 rounded-2xl shadow-md border-t-4 border-blue-main"\>  
                    \<h3 class="text-xl font-bold text-blue-main mb-3"\>By Week 8:\</h3\>  
                    \<ul class="list-disc list-inside space-y-2 text-gray-700"\>  
                        \<li\>More stable blood sugar levels\</li\>  
                        \<li\>Improvements in mood and mental clarity\</li\>  
                        \<li\>Weight loss (if needed) that feels sustainable\</li\>  
                        \<li\>Increased confidence in your food choices\</li\>  
                    \</ul\>  
                \</div\>  
                \<div class="bg-white p-6 rounded-2xl shadow-md border-t-4 border-green-main"\>  
                    \<h3 class="text-xl font-bold text-green-main mb-3"\>By Week 12:\</h3\>  
                    \<ul class="list-disc list-inside space-y-2 text-gray-700"\>  
                        \<li\>Significant improvement in PCOS symptoms (if applicable)\</li\>  
                        \<li\>Reversed or improved prediabetic markers\</li\>  
                        \<li\>Established healthy habits that feel natural\</li\>  
                        \<li\>A clear roadmap for maintaining your progress long-term\</li\>  
                    \</ul\>  
                \</div\>  
            \</div\>  
        \</section\>

        \<\!-- Investment & Next Steps Section \--\>  
        \<section class="text-center bg-white p-8 md:p-12 rounded-2xl shadow-2xl max-w-3xl mx-auto"\>  
            \<h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4"\>Investment & Next Steps\</h2\>  
            \<p class="text-lg text-gray-700 mb-6"\>  
                This intensive represents a significant commitment to your health and future. As a founding client, you'll receive unprecedented access and support as we refine this program together.  
            \</p\>  
            \<div class="space-y-4 mb-8"\>  
                \<p class="font-bold text-xl"\>Founding Client Opportunity:\</p\>  
                \<p class="text-gray-600"\>Join my founding group of clients and help shape this program while receiving exceptional value and support.\</p\>  
                \<p class="text-gray-600"\>\<b\>What This Includes:\</b\> Everything listed above plus 6 months of complimentary post-program support.\</p\>  
            \</div\>  
            \<p class="text-lg text-gray-700 mb-8"\>  
                \<b\>Next Steps:\</b\> Complete the application below. I personally review each application and will reach out within 24-48 hours if it seems like we'd be a good fit to work together.  
            \</p\>  
              
            \<a href="https://huntersholistichealth.com/contact" class="inline-block bg-blue-main text-white font-bold py-4 px-8 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-300 transform hover:scale-105"\>  
                Apply for the 90-Day Intensive  
            \</a\>  
              
            \<p class="mt-8 text-xl text-gray-700 max-w-2xl mx-auto"\>  
                If you're ready to stop fighting your body and start working with it, if you're committed to addressing root causes rather than managing symptoms, and if you're prepared to invest in a systematic approach that has worked for me personally—then I'd love to explore working together.  
            \</p\>  
        \</section\>

    \</main\>

    \<script\>  
        function toggleDetails(id) {  
            const details \= document.getElementById(id \+ '-details');  
            if (details.classList.contains('hidden')) {  
                details.classList.remove('hidden');  
            } else {  
                details.classList.add('hidden');  
            }  
        }  
    \</script\>  
\</body\>  
\</html\>

Plate builder  
\<\!DOCTYPE html\>  
\<html lang="en"\>  
\<head\>  
    \<meta charset="UTF-8"\>  
    \<meta name="viewport" content="width=device-width, initial-scale=1.0"\>  
    \<title\>The Ultimate Global & Culturally Inclusive PCOS, Insulin Resistance & Diabetes Interactive Guide\</title\>  
    \<script src="https://cdn.tailwindcss.com"\>\</script\>  
    \<script src="https://cdn.jsdelivr.net/npm/chart.js"\>\</script\>  
    \<link rel="preconnect" href="https://fonts.googleapis.com"\>  
    \<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin\>  
    \<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700\&display=swap" rel="stylesheet"\>  
    \<style\>  
        body { font-family: 'Inter', sans-serif; background-color: \#FDFBF8; }  
        .nav-button { transition: all 0.3s ease; }  
        .nav-button.active { background-color: \#4A5568; color: \#FFFFFF; }  
        .nav-button:not(.active):hover { background-color: \#E2E8F0; }  
        .content-section { display: none; }  
        .content-section.active { display: block; animation: fadeIn 0.5s ease-in-out; }  
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }  
        .food-category-button.active { background-color: \#6B7280; color: white; }  
        .food-card { transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out; }  
        .food-card:hover { transform: translateY(-4px); }  
        .chart-container { position: relative; width: 100%; max-width: 400px; margin-left: auto; margin-right: auto; height: 350px; max-height: 400px; }  
        .meal-type-button.active { background-color: \#6B7280; color: white; }  
    \</style\>  
\</head\>  
\<body class="bg-\[\#FDFBF8\] text-gray-800 antialiased"\>

    \<div class="container mx-auto px-4 py-8 max-w-5xl"\>

        \<header class="text-center mb-8"\>  
            \<h1 class="text-3xl md:text-4xl font-bold text-gray-700"\>The Ultimate Global & Culturally Inclusive PCOS, Insulin Resistance & Diabetes Interactive Guide\</h1\>  
            \<p class="mt-2 text-lg text-gray-500"\>A friendly, visual guide to nourishing your body.\</p\>  
        \</header\>

        \<nav class="flex flex-wrap justify-center gap-2 md:gap-4 mb-10 p-2 bg-gray-100 rounded-lg shadow-sm"\>  
            \<button data-target="start" class="nav-button active px-4 py-2 text-sm md:text-base font-semibold text-gray-600 rounded-md"\>Start Here\</button\>  
            \<button data-target="why" class="nav-button px-4 py-2 text-sm md:text-base font-semibold text-gray-600 rounded-md"\>The Why\</button\>  
            \<button data-target="plate" class="nav-button px-4 py-2 text-sm md:text-base font-semibold text-gray-600 rounded-md"\>Plate Builder\</button\>  
            \<button data-target="meal-builder" class="nav-button px-4 py-2 text-sm md:text-base font-semibold text-gray-600 rounded-md"\>Meal Builder\</button\>  
            \<button data-target="list" class="nav-button px-4 py-2 text-sm md:text-base font-semibold text-gray-600 rounded-md"\>Grocery List\</button\>  
            \<button data-target="cautions" class="nav-button px-4 py-2 text-sm md:text-base font-semibold text-gray-600 rounded-md"\>Tips & Cautions\</button\>  
        \</nav\>

        \<main id="main-content"\>

            \<section id="start" class="content-section active"\>  
                \<div class="bg-white p-6 md:p-8 rounded-xl shadow-md"\>  
                    \<h2 class="text-2xl font-bold text-gray-700 mb-4"\>Welcome to Your Health Journey\!\</h2\>  
                    \<p class="text-gray-600 leading-relaxed mb-4"\>Navigating Polycystic Ovary Syndrome (PCOS), insulin resistance, and diabetes can feel complex, but you're in the right place. This guide is designed to be your friendly companion, empowering you to make smart, delicious food choices. It's not about strict dieting; it's about nourishing your body to help balance your hormones, manage blood sugar, and feel your best.\</p\>  
                    \<p class="text-gray-600 leading-relaxed"\>Use the tabs above to explore the core principles of a PCOS-friendly lifestyle, build a virtual plate to understand meal composition, learn how to apply these principles to your daily meals, and browse a comprehensive grocery list to make your next shopping trip a breeze. We've expanded our food list to be more global and culturally inclusive, recognizing that healthy eating looks different around the world\!\</p\>  
                \</div\>  
            \</section\>

            \<section id="why" class="content-section"\>  
                   \<div class="bg-white p-6 md:p-8 rounded-xl shadow-md"\>  
                     \<h2 class="text-2xl font-bold text-gray-700 mb-4"\>Understanding the Connection: Food, Insulin, & Blood Sugar\</h2\>  
                      \<p class="text-gray-600 leading-relaxed mb-4"\>This section explains the crucial link between your diet and PCOS symptoms, especially concerning insulin resistance and blood sugar management, which are key for managing diabetes as well. Understanding this connection is the first step toward using food as a powerful tool for your well-being.\</p\>  
                     \<p class="text-gray-600 leading-relaxed mb-4"\>Many women with PCOS also experience insulin resistance. Think of insulin as a key that unlocks your cells to let sugar (glucose) in for energy. With insulin resistance, your cells don't respond well to this key. In response, your body produces even more insulin to try and force the cells to open.\</p\>  
                     \<p class="text-gray-600 leading-relaxed font-medium text-gray-700"\>These high insulin levels can directly contribute to PCOS symptoms by telling the ovaries to produce more androgens (like testosterone), leading to hormonal imbalances, weight gain, and irregular cycles. Over time, this constant demand can exhaust the pancreas, potentially leading to Type 2 Diabetes.\</p\>  
                      \<p class="text-gray-600 leading-relaxed mt-4"\>The great news? By choosing foods that keep your blood sugar and insulin levels stable, you can directly combat this cycle and significantly improve your symptoms, whether you're managing PCOS, insulin resistance, or diabetes.\</p\>  
                 \</div\>  
            \</section\>

            \<section id="plate" class="content-section"\>  
                \<div class="bg-white p-6 md:p-8 rounded-xl shadow-md"\>  
                    \<h2 class="text-2xl font-bold text-gray-700 mb-2 text-center"\>The Ideal PCOS Plate: A Hormone-Balancing Approach\</h2\>  
                    \<p class="text-center text-gray-600 mb-6"\>For those with insulin resistance, a meal plate that prioritizes protein and healthy fats is key. These nutrients are essential for regulating hormones and maintaining satiety, while a smaller portion of slow-digesting carbs provides sustained energy without causing blood sugar spikes. Remember to fill the rest of your plate with \<strong\>non-starchy vegetables\</strong\> (not shown in the chart below) for fiber and nutrients\!\</p\>  
                    \<div class="flex flex-col lg:flex-row items-center gap-8"\>  
                        \<div class="chart-container"\>  
                            \<canvas id="plateChart"\>\</canvas\>  
                        \</div\>  
                        \<div class="flex-1"\>  
                            \<div id="plate-info" class="p-4 bg-gray-50 rounded-lg text-center min-h-\[120px\] flex items-center justify-center"\>  
                                \<p class="text-gray-700 text-lg"\>Click a button to learn about each part of your plate.\</p\>  
                            \</div\>  
                            \<div class="grid grid-cols-3 gap-3 mt-4"\>  
                                \<button data-segment="0" class="plate-segment-btn w-full p-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"\>40% Protein\</button\>  
                                \<button data-segment="1" class="plate-segment-btn w-full p-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-colors"\>40% Healthy Fats\</button\>  
                                \<button data-segment="2" class="plate-segment-btn w-full p-3 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition-colors"\>20% Slow Carbs\</button\>  
                            \</div\>  
                        \</div\>  
                    \</div\>  
                \</div\>  
            \</section\>

            \<section id="meal-builder" class="content-section"\>  
                \<div class="bg-white p-6 md:p-8 rounded-xl shadow-md"\>  
                    \<h2 class="text-2xl font-bold text-gray-700 mb-2 text-center"\>Build Your Balanced Meals\</h2\>  
                    \<p class="text-center text-gray-600 mb-6"\>Apply the ideal plate proportions to your daily meals\! Select a meal type below to see how to construct a balanced and delicious plate, complete with examples from our diverse food list.\</p\>  
                    \<div class="flex flex-wrap justify-center gap-2 mb-8"\>  
                        \<button data-meal-type="breakfast" class="meal-type-button active px-4 py-2 text-sm md:text-base font-semibold text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"\>Breakfast\</button\>  
                        \<button data-meal-type="lunch" class="meal-type-button px-4 py-2 text-sm md:text-base font-semibold text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"\>Lunch\</button\>  
                        \<button data-meal-type="dinner" class="meal-type-button px-4 py-2 text-sm md:text-base font-semibold text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"\>Dinner\</button\>  
                    \</div\>  
                    \<div class="flex flex-col lg:flex-row items-center gap-8"\>  
                        \<div class="chart-container"\>  
                            \<canvas id="mealBuilderChart"\>\</canvas\>  
                        \</div\>  
                        \<div class="flex-1"\>  
                            \<div id="meal-builder-info" class="p-4 bg-gray-50 rounded-lg min-h-\[150px\] flex flex-col justify-center"\>  
                                \<h3 class="text-xl font-bold text-gray-700 mb-2"\>Breakfast Focus:\</h3\>  
                                \<p class="text-gray-600 leading-relaxed mb-2"\>Start your day with a focus on protein and healthy fats to stabilize blood sugar and keep you full. Pair with a small serving of complex carbs and plenty of non-starchy veggies.\</p\>  
                                \<p class="text-gray-700 font-semibold"\>Examples:\</p\>  
                                \<ul class="list-disc list-inside text-gray-600"\>  
                                    \<li\>Scrambled eggs with spinach and mushrooms, a side of avocado.\</li\>  
                                    \<li\>Plain Greek yogurt with berries, chia seeds, and a few almonds.\</li\>  
                                    \<li\>Oatmeal (steel-cut) with a scoop of unsweetened protein powder, cinnamon, and a few walnuts.\</li\>  
                                \</ul\>  
                            \</div\>  
                        \</div\>  
                    \</div\>  
                \</div\>  
            \</section\>  
              
            \<section id="list" class="content-section"\>  
                \<div class="bg-white p-6 md:p-8 rounded-xl shadow-md"\>  
                    \<h2 class="text-2xl font-bold text-gray-700 mb-2 text-center"\>Your PCOS-Friendly Grocery List\</h2\>  
                    \<p class="text-center text-gray-600 mb-6"\>Here are the foods that will help you thrive. Click a category below to filter the list and make your shopping simple and focused. This is your toolkit for building healthy, delicious meals, with a wide variety of global and culturally inclusive options\!\</p\>  
                    \<div id="food-category-filters" class="flex flex-wrap justify-center gap-2 mb-8"\>  
                        \</div\>  
                    \<div id="food-list" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"\>  
                        \</div\>  
                \</div\>  
            \</section\>

            \<section id="cautions" class="content-section"\>  
                \<div class="bg-white p-6 md:p-8 rounded-xl shadow-md"\>  
                    \<h2 class="text-2xl font-bold text-gray-700 mb-4"\>Smart Shopping Tips & Foods to Limit\</h2\>  
                    \<p class="text-gray-600 leading-relaxed mb-6"\>Knowledge is power, both in what to choose and what to be mindful of. This section covers practical tips for your grocery runs and highlights foods that are best enjoyed in moderation or avoided to help manage your symptoms.\</p\>  
                    \<div class="grid md:grid-cols-2 gap-8"\>  
                        \<div\>  
                            \<h3 class="text-xl font-semibold text-gray-700 mb-3 border-b-2 border-green-300 pb-2"\>✓ Smart Shopping Tips\</h3\>  
                            \<ul class="space-y-3 text-gray-600"\>  
                                \<li class="flex items-start"\>\<span class="text-green-500 mr-2"\>🛒\</span\> \<div\>\<span class="font-semibold"\>Shop the Perimeter:\</span\> Fresh produce, meats, and dairy are usually on the outer edges of the store.\</div\>\</li\>  
                                \<li class="flex items-start"\>\<span class="text-green-500 mr-2"\>🔍\</span\> \<div\>\<span class="font-semibold"\>Read Labels:\</span\> Look for hidden sugars and unhealthy fats.\</div\>\</li\>  
                                \<li class="flex items-start"\>\<span class="text-green-500 mr-2"\>🚫\</span\> \<div\>\<span class="font-semibold"\>Choose "Unsweetened":\</span\> Especially for yogurts and plant-based milks.\</div\>\</li\>  
                                \<li class="flex items-start"\>\<span class="text-green-500 mr-2"\>❄️\</span\> \<div\>\<span class="font-semibold"\>Buy Frozen:\</span\> Frozen fruits and veggies are just as nutritious and often more affordable.\</div\>\</li\>  
                                \<li class="flex items-start"\>\<span class="text-green-500 mr-2"\>📝\</span\> \<div\>\<span class="font-semibold"\>Plan Ahead:\</span\> A list prevents impulse buys and keeps you on track.\</div\>\</li\>  
                            \</ul\>  
                        \</div\>  
                        \<div class="bg-red-50 p-6 rounded-lg"\>  
                            \<h3 class="text-xl font-semibold text-red-700 mb-3 border-b-2 border-red-200 pb-2"\>✗ Foods to Limit or Avoid\</h3\>  
                             \<ul class="space-y-3 text-red-800"\>  
                                \<li class="flex items-start"\>\<span class="text-red-500 mr-2"\>🍬\</span\> \<div\>\<span class="font-semibold"\>Refined Sugars:\</span\> Candies, sodas, sugary drinks, pastries, cookies, and most desserts. Be aware of hidden sugars like: High-fructose corn syrup, Glucose, Dextrose, Maltose, Sucrose, Corn syrup solids, Fruit juice concentrate, Agave nectar, Maple syrup, Honey, Brown rice syrup, Cane sugar, Raw sugar, Turbinado, Molasses.\</div\>\</li\>  
                                \<li class="flex items-start"\>\<span class="text-red-500 mr-2"\>🍞\</span\> \<div\>\<span class="font-semibold"\>Refined Grains:\</span\> White bread, white pasta, white rice, sugary cereals.\</div\>\</li\>  
                                \<li class="flex items-start"\>\<span class="text-red-500 mr-2"\>🍟\</span\> \<div\>\<span class="font-semibold"\>Processed Foods & Unhealthy Fats:\</span\> Packaged snacks, fast food, highly processed meals, trans fats (often in fried foods, some margarines).\</div\>\</li\>  
                                \<li class="flex items-start"\>\<span class="text-red-500 mr-2"\>🥭\</span\> \<div\>\<span class="font-semibold"\>Excessive High-Glycemic Fruits:\</span\> Limit tropical fruits like ripe mangoes, bananas, and pineapple, especially if eaten alone. Pair them with protein or fat if you do.\</div\>\</li\>  
                            \</ul\>  
                        \</div\>  
                    \</div\>  
                \</div\>  
            \</section\>  
        \</main\>  
    \</div\>

    \<script\>  
        document.addEventListener('DOMContentLoaded', () \=\> {  
            const mainNavButtons \= document.querySelectorAll('.nav-button');  
            const contentSections \= document.querySelectorAll('.content-section');  
            let plateChart \= null;  
            let mealBuilderChart \= null;

            const foodData \= {  
                'All': \[\],  
                'Lean Proteins': \[  
                    'Chicken Breast (skinless)', 'Turkey (ground, breast)', 'Salmon', 'Mackerel', 'Sardines', 'Cod', 'Tuna', 'Mahi-Mahi', 'Snapper', 'Shrimp', 'Scallops', 'Lean Beef (grass-fed)', 'Eggs', 'Tofu', 'Tempeh', 'Edamame', 'Lentils (all types)', 'Black Beans', 'Chickpeas', 'Kidney Beans', 'Navy Beans', 'Pinto Beans', 'Black-Eyed Peas', 'Pigeon Peas (Gungo Peas)', 'Mung Beans', 'Split Peas', 'Quorn', 'Seitan', 'Cottage Cheese', 'Plain Greek Yogurt', 'Whey Protein Powder (unsweetened)', 'Pea Protein Powder (unsweetened)', 'Rice Protein Powder (unsweetened)'  
                \],  
                'Healthy Fats': \[  
                    'Avocados', 'Almonds', 'Walnuts', 'Pecans', 'Brazil Nuts', 'Cashews', 'Pistachios', 'Hazelnuts', 'Chia Seeds', 'Flax Seeds', 'Hemp Seeds', 'Pumpkin Seeds', 'Sunflower Seeds', 'Sesame Seeds', 'Nut Butters (almond, peanut \- no added sugar)', 'Extra Virgin Olive Oil', 'Avocado Oil', 'Flaxseed Oil', 'Coconut Oil (in moderation)', 'Ghee (in moderation)', 'Olives'  
                \],  
                'Non-Starchy Veggies': \[  
                    'Spinach', 'Kale', 'Collard Greens', 'Swiss Chard', 'Romaine Lettuce', 'Arugula', 'Watercress', 'Bok Choy', 'Broccoli', 'Cauliflower', 'Brussels Sprouts', 'Cabbage', 'Bell Peppers (all colors)', 'Zucchini', 'Cucumber', 'Tomatoes', 'Asparagus', 'Green Beans', 'Mushrooms', 'Onions', 'Garlic', 'Eggplant', 'Okra', 'Callaloo', 'Bitter Melon (Karela)', 'Radishes', 'Artichokes', 'Fennel', 'Celery', 'Leeks', 'Snap Peas', 'Snow Peas', 'Koriander', 'Parsley', 'Dill', 'Mint', 'Chives', 'Scallions'  
                \],  
                'Low GI Fruits': \[  
                    'Berries (strawberries, blueberries, raspberries, blackberries, cranberries \- fresh or frozen)', 'Apples', 'Pears', 'Oranges', 'Grapefruit', 'Cherries', 'Kiwi', 'Plums', 'Peaches', 'Apricots', 'Guava', 'Passion Fruit (in moderation)', 'Star Fruit', 'Pomegranates', 'Lemons', 'Limes'  
                \],  
                'Complex Carbs (Portion Controlled)': \[  
                    'Quinoa', 'Oats (rolled or steel-cut, unsweetened)', 'Brown Rice', 'Wild Rice', 'Barley', 'Farro', 'Bulgur', 'Whole-Grain Bread (100% whole grain, minimal sugar)', 'Whole-Grain Pasta', 'Sweet Potatoes', 'Yams', 'Green (Unripe) Plantains', 'Cassava (Yuca \- in moderation)', 'Whole-Grain Cornmeal', 'Sorghum', 'Millet', 'Buckwheat', 'Ezekiel Bread', 'Whole-Wheat Tortillas'  
                \],  
                'Dairy & Alternatives': \[  
                    'Plain Greek Yogurt (unsweetened)', 'Unsweetened Almond Milk', 'Unsweetened Soy Milk', 'Unsweetened Oat Milk', 'Unsweetened Coconut Milk', 'Kefir (plain, unsweetened)', 'Ricotta Cheese', 'Feta Cheese', 'Mozzarella Cheese', 'Hard Cheeses (in moderation)'  
                \],  
                'Herbs & Spices': \[  
                    'Cinnamon (Ceylon)', 'Turmeric', 'Ginger', 'Garlic Powder', 'Onion Powder', 'Oregano', 'Basil', 'Thyme', 'Rosemary', 'Black Pepper', 'Cayenne Pepper', 'Cumin', 'Coriander', 'Paprika', 'Chili Powder', 'Allspice', 'Pimento', 'Nutmeg', 'Cloves', 'Curry Powder (check ingredients for sugar)', 'Scotch Bonnet Pepper (in moderation)', 'Bay Leaf'  
                \],  
                'Beverages': \[  
                    'Water (filtered)', 'Unsweetened Herbal Teas (peppermint, chamomile, green tea, ginger tea)', 'Black Coffee (in moderation, no sugar/creamer)', 'Sparkling Water (plain or with fruit)', 'Unsweetened Coconut Water (in moderation)', 'Vegetable Juices (freshly made, no added sugar)'  
                \]  
            };  
            foodData.All \= \[\].concat(...Object.values(foodData).slice(1));  
              
            const foodListContainer \= document.getElementById('food-list');  
            const categoryFiltersContainer \= document.getElementById('food-category-filters');

            function renderFoodList(category \= 'All') {  
                foodListContainer.innerHTML \= '';  
                const items \= foodData\[category\] || foodData\['All'\];  
                items.forEach(item \=\> {  
                    const card \= document.createElement('div');  
                    card.className \= 'food-card bg-gray-50 p-3 rounded-lg text-center shadow-sm hover:shadow-md cursor-pointer';  
                    card.innerHTML \= \`\<p class="font-medium text-gray-700 text-sm"\>${item}\</p\>\`;  
                    foodListContainer.appendChild(card);  
                });  
            }

            function renderCategoryFilters() {  
                Object.keys(foodData).forEach(category \=\> {  
                    const button \= document.createElement('button');  
                    button.className \= 'food-category-button px-3 py-1 text-sm font-semibold text-gray-600 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors';  
                    button.textContent \= category;  
                    if (category \=== 'All') {  
                        button.classList.add('active');  
                    }  
                    button.addEventListener('click', () \=\> {  
                        document.querySelectorAll('.food-category-button').forEach(btn \=\> btn.classList.remove('active'));  
                        button.classList.add('active');  
                        renderFoodList(category);  
                    });  
                    categoryFiltersContainer.appendChild(button);  
                });  
            }

            mainNavButtons.forEach(button \=\> {  
                button.addEventListener('click', () \=\> {  
                    const targetId \= button.dataset.target;

                    mainNavButtons.forEach(btn \=\> btn.classList.remove('active'));  
                    button.classList.add('active');

                    contentSections.forEach(section \=\> {  
                        if (section.id \=== targetId) {  
                            section.classList.add('active');  
                            if (targetId \=== 'plate' && \!plateChart) {  
                                renderPlateChart();  
                            }  
                            if (targetId \=== 'meal-builder' && \!mealBuilderChart) {  
                                renderMealBuilderChart();  
                            }  
                        } else {  
                            section.classList.remove('active');  
                        }  
                    });  
                });  
            });  
              
            const plateInfoContent \= {  
                0: { title: "40% Protein", text: "Protein is a cornerstone of a PCOS-friendly diet. It is essential for building muscle, helps you feel full longer, and has a minimal impact on blood sugar. A higher protein intake can help reduce insulin levels and cravings. Choose lean meats, fish, eggs, tofu, or lentils." },  
                1: { title: "40% Healthy Fats", text: "Healthy fats are vital for hormone production and regulating satiety, which helps with appetite control. They slow down the absorption of carbohydrates, preventing blood sugar spikes. Incorporate avocados, nuts, seeds, and olive oil into your meals." },  
                2: { title: "20% Slow Carbs", text: "A modest portion of complex, high-fiber carbohydrates provides steady, sustained energy without overwhelming your system. These 'slow carbs' break down gradually, which helps to keep insulin levels stable. Examples include quinoa, brown rice, oats, and sweet potatoes." }  
            };

            const mealContent \= {  
                'breakfast': {  
                    title: "Breakfast Focus:",  
                    description: "Prioritize protein and healthy fats to manage morning blood sugar spikes and keep you satisfied until your next meal. Pair these with a small portion of a complex carb and a side of non-starchy veggies.",  
                    examples: \[  
                        "Scrambled eggs (protein & fat) with a side of sautéed spinach and mushrooms (veggies).",  
                        "Plain Greek yogurt (protein) with a handful of berries (slow carbs) and a sprinkle of walnuts and chia seeds (fats).",  
                        "Oatmeal (steel-cut) with unsweetened protein powder (protein) and a drizzle of almond butter (fat)."  
                    \]  
                },  
                'lunch': {  
                    title: "Lunch Focus:",  
                    description: "Build a lunch that sustains your energy without causing a mid-afternoon crash. A generous portion of protein, healthy fats, and a side of slow carbs will keep you fueled and focused.",  
                    examples: \[  
                        "Large salad with grilled salmon (protein & fat) and avocado (fat), with a small side of quinoa (slow carb).",  
                        "Lentil soup (protein & slow carb) with a drizzle of olive oil (fat) and a side of roasted vegetables (veggies).",  
                        "Chicken stir-fry (protein) with mixed vegetables like broccoli and bell peppers (veggies) and a small serving of brown rice (slow carb)."  
                    \]  
                },  
                'dinner': {  
                    title: "Dinner Focus:",  
                    description: "Your final meal should be satisfying and supportive of overnight blood sugar control. A focus on protein and fats with a modest amount of complex carbs is ideal.",  
                    examples: \[  
                        "Baked cod (protein) with roasted brussels sprouts (veggies) and a small sweet potato (slow carb) topped with ghee (fat).",  
                        "Black bean and corn salsa (protein & slow carb) with lean ground turkey (protein) and a side of leafy greens (veggies) dressed with a lime and cilantro vinaigrette (fat).",  
                        "Chicken and vegetable curry (protein, fat, veggies) made with full-fat coconut milk, served with a small side of wild rice (slow carb)."  
                    \]  
                }  
            };

            const plateInfoEl \= document.getElementById('plate-info');  
            const mealBuilderInfoEl \= document.getElementById('meal-builder-info');  
              
            document.querySelectorAll('.plate-segment-btn').forEach(button \=\> {  
                button.addEventListener('click', (e) \=\> {  
                    const segmentIndex \= parseInt(e.currentTarget.dataset.segment);  
                    const info \= plateInfoContent\[segmentIndex\];  
                    plateInfoEl.innerHTML \= \`\<p class="font-bold text-gray-800"\>${info.title}\</p\>\<p class="text-sm text-gray-600 mt-1"\>${info.text}\</p\>\`;  
                      
                    if(plateChart) {  
                        plateChart.data.datasets\[0\].backgroundColor \= plateChart.data.datasets\[0\].backgroundColor.map((c, i) \=\> i \=== segmentIndex ? '\#222' : chartColors\[i\]);  
                        plateChart.update();  
                          
                        setTimeout(() \=\> {  
                            plateChart.data.datasets\[0\].backgroundColor \= chartColors;  
                            plateChart.update();  
                        }, 500);  
                    }  
                });  
            });

            const chartColors \= \['\#60a5fa', '\#a78bfa', '\#facc15'\];

            function renderPlateChart() {  
                const ctx \= document.getElementById('plateChart').getContext('2d');  
                plateChart \= new Chart(ctx, {  
                    type: 'doughnut',  
                    data: {  
                        labels: \['Protein', 'Healthy Fats', 'Slow Carbs'\],  
                        datasets: \[{  
                            label: 'Ideal Plate',  
                            data: \[40, 40, 20\],  
                            backgroundColor: chartColors,  
                            borderColor: '\#FDFBF8',  
                            borderWidth: 5,  
                            hoverBorderWidth: 8,  
                            hoverBorderColor: '\#fff'  
                        }\]  
                    },  
                    options: {  
                        responsive: true,  
                        maintainAspectRatio: false,  
                        cutout: '50%',  
                        plugins: {  
                            legend: {  
                                display: false  
                            },  
                            tooltip: {  
                                enabled: true,  
                                callbacks: {  
                                    label: function(context) {  
                                        let label \= context.label || '';  
                                        if (label) {  
                                            label \+= ': ';  
                                        }  
                                        if (context.parsed \!== null) {  
                                            label \+= context.parsed \+ '%';  
                                        }  
                                        return label;  
                                    }  
                                }  
                            }  
                        }  
                    }  
                });  
            }

            function updateMealBuilderContent(mealType) {  
                const content \= mealContent\[mealType\];  
                let examplesHtml \= content.examples.map(ex \=\> \`\<li\>${ex}\</li\>\`).join('');  
                mealBuilderInfoEl.innerHTML \= \`  
                    \<h3 class="text-xl font-bold text-gray-700 mb-2"\>${content.title}\</h3\>  
                    \<p class="text-gray-600 leading-relaxed mb-2"\>${content.description}\</p\>  
                    \<p class="text-gray-700 font-semibold"\>Examples:\</p\>  
                    \<ul class="list-disc list-inside text-gray-600"\>  
                        ${examplesHtml}  
                    \</ul\>  
                \`;

                // Update the chart to visually represent the plate proportions for the selected meal  
                if (mealBuilderChart) {  
                    mealBuilderChart.data.datasets\[0\].data \= \[40, 40, 20\]; // New proportions  
                    mealBuilderChart.update();  
                }  
            }

            function renderMealBuilderChart() {  
                const ctx \= document.getElementById('mealBuilderChart').getContext('2d');  
                mealBuilderChart \= new Chart(ctx, {  
                    type: 'doughnut',  
                    data: {  
                        labels: \['Protein', 'Healthy Fats', 'Slow Carbs'\],  
                        datasets: \[{  
                            label: 'Ideal Meal Proportions',  
                            data: \[40, 40, 20\],  
                            backgroundColor: chartColors,  
                            borderColor: '\#FDFBF8',  
                            borderWidth: 5,  
                            hoverBorderWidth: 8,  
                            hoverBorderColor: '\#fff'  
                        }\]  
                    },  
                    options: {  
                        responsive: true,  
                        maintainAspectRatio: false,  
                        cutout: '50%',  
                        plugins: {  
                            legend: {  
                                display: false  
                            },  
                            tooltip: {  
                                enabled: true,  
                                callbacks: {  
                                    label: function(context) {  
                                        let label \= context.label || '';  
                                        if (label) {  
                                            label \+= ': ';  
                                        }  
                                        if (context.parsed \!== null) {  
                                            label \+= context.parsed \+ '%';  
                                        }  
                                        return label;  
                                    }  
                                }  
                            }  
                        }  
                    }  
                });  
                updateMealBuilderContent('breakfast'); // Initialize with breakfast content  
            }

            document.querySelectorAll('.meal-type-button').forEach(button \=\> {  
                button.addEventListener('click', (e) \=\> {  
                    const mealType \= e.currentTarget.dataset.mealType;  
                    document.querySelectorAll('.meal-type-button').forEach(btn \=\> btn.classList.remove('active'));  
                    e.currentTarget.classList.add('active');  
                    updateMealBuilderContent(mealType);  
                });  
            });

            renderCategoryFilters();  
            renderFoodList();  
        });  
    \</script\>  
\</body\>  
\</html\>

Meal macro planner : interactive

\<\!DOCTYPE html\>  
\<html lang="en"\>  
\<head\>  
    \<meta charset="UTF-8"\>  
    \<meta name="viewport" content="width=device-width, initial-scale=1.0"\>  
    \<title\>Interactive Meal Macro Planner\</title\>  
    \<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700\&display=swap" rel="stylesheet"\>  
    \<style\>  
        :root {  
            \--primary-color: \#4CAF50; /\* Green \*/  
            \--secondary-color: \#2196F3; /\* Blue \*/  
            \--accent-color: \#FFC107; /\* Amber \*/  
            \--background-color: \#f4f7f6;  
            \--card-background: \#ffffff;  
            \--text-color: \#333;  
            \--border-color: \#e0e0e0;  
            \--progress-bar-bg: \#e0e0e0;  
            \--progress-bar-fill-low: \#ffeb3b; /\* Yellow \*/  
            \--progress-bar-fill-medium: \#8bc34a; /\* Light Green \*/  
            \--progress-bar-fill-high: \#4CAF50; /\* Green \*/  
            \--progress-bar-fill-over: \#f44336; /\* Red \*/  
        }

        body {  
            font-family: 'Roboto', sans-serif;  
            line-height: 1.6;  
            color: var(--text-color);  
            background-color: var(--background-color);  
            margin: 0;  
            padding: 20px;  
            display: flex;  
            justify-content: center;  
            align-items: flex-start;  
            min-height: 100vh;  
        }

        .container {  
            background-color: var(--card-background);  
            border-radius: 12px;  
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);  
            width: 100%;  
            max-width: 1200px;  
            padding: 30px;  
            box-sizing: border-box;  
        }

        h1, h2 {  
            color: var(--primary-color);  
            text-align: center;  
            margin-bottom: 25px;  
            font-weight: 700;  
        }

        h2 {  
            font-size: 1.8em;  
            border-bottom: 2px solid var(--border-color);  
            padding-bottom: 15px;  
            margin-top: 40px;  
        }

        .section {  
            margin-bottom: 30px;  
            padding: 25px;  
            background-color: \#fdfdfd;  
            border-radius: 10px;  
            border: 1px solid var(--border-color);  
        }

        .input-group {  
            margin-bottom: 20px;  
            display: flex;  
            flex-direction: column;  
        }

        .input-group label {  
            margin-bottom: 8px;  
            font-weight: 500;  
            color: var(--text-color);  
        }

        .input-group input\[type="number"\],  
        .input-group select {  
            padding: 12px 15px;  
            border: 1px solid var(--border-color);  
            border-radius: 8px;  
            font-size: 1em;  
            width: 100%;  
            box-sizing: border-box;  
            transition: border-color 0.3s ease;  
        }

        .input-group input\[type="number"\]:focus,  
        .input-group select:focus {  
            outline: none;  
            border-color: var(--secondary-color);  
            box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.2);  
        }

        .helper-text {  
            font-size: 0.9em;  
            color: \#777;  
            margin-top: 5px;  
            padding-left: 2px;  
        }

        .tabs {  
            display: flex;  
            margin-bottom: 25px;  
            border-bottom: 2px solid var(--border-color);  
        }

        .tab-button {  
            background-color: \#f0f0f0;  
            border: none;  
            padding: 15px 25px;  
            cursor: pointer;  
            font-size: 1.1em;  
            font-weight: 500;  
            transition: background-color 0.3s ease, color 0.3s ease;  
            border-top-left-radius: 8px;  
            border-top-right-radius: 8px;  
            margin-right: 5px;  
            color: \#555;  
        }

        .tab-button.active {  
            background-color: var(--primary-color);  
            color: white;  
            border-bottom: 2px solid var(--primary-color);  
            margin-bottom: \-2px; /\* To make the bottom border align perfectly \*/  
        }

        .tab-content {  
            display: none;  
            padding-top: 20px;  
            animation: fadeIn 0.5s ease-out;  
        }

        .tab-content.active {  
            display: block;  
        }

        @keyframes fadeIn {  
            from { opacity: 0; transform: translateY(10px); }  
            to { opacity: 1; transform: translateY(0); }  
        }

        .meal-builder-controls {  
            display: grid;  
            grid-template-columns: 2fr 1fr 0.5fr;  
            gap: 15px;  
            margin-bottom: 25px;  
            align-items: flex-end;  
        }

        .meal-builder-controls button {  
            padding: 12px 20px;  
            background-color: var(--secondary-color);  
            color: white;  
            border: none;  
            border-radius: 8px;  
            cursor: pointer;  
            font-size: 1em;  
            transition: background-color 0.3s ease, transform 0.2s ease;  
        }

        .meal-builder-controls button:hover {  
            background-color: \#1976D2;  
            transform: translateY(-2px);  
        }

        .current-meal-items {  
            margin-top: 25px;  
            border-top: 1px solid var(--border-color);  
            padding-top: 20px;  
        }

        .current-meal-items ul {  
            list-style: none;  
            padding: 0;  
            max-height: 250px;  
            overflow-y: auto;  
            border: 1px solid var(--border-color);  
            border-radius: 8px;  
            background-color: \#fafafa;  
        }

        .current-meal-items li {  
            display: flex;  
            justify-content: space-between;  
            align-items: center;  
            padding: 12px 15px;  
            border-bottom: 1px solid var(--border-color);  
        }

        .current-meal-items li:last-child {  
            border-bottom: none;  
        }

        .current-meal-items li button {  
            background-color: \#f44336;  
            color: white;  
            border: none;  
            padding: 6px 12px;  
            border-radius: 5px;  
            cursor: pointer;  
            font-size: 0.85em;  
            transition: background-color 0.3s ease;  
        }

        .current-meal-items li button:hover {  
            background-color: \#d32f2f;  
        }

        .macro-tracker {  
            margin-top: 25px;  
            padding-top: 20px;  
            border-top: 1px solid var(--border-color);  
        }

        .progress-bar-container {  
            display: flex;  
            align-items: center;  
            margin-bottom: 15px;  
            gap: 15px;  
        }

        .progress-bar-label {  
            min-width: 120px;  
            font-weight: 500;  
        }

        .progress-bar-wrapper {  
            flex-grow: 1;  
            background-color: var(--progress-bar-bg);  
            border-radius: 10px;  
            height: 25px;  
            overflow: hidden;  
            position: relative;  
        }

        .progress-bar-fill {  
            height: 100%;  
            width: 0%;  
            border-radius: 10px;  
            background-color: var(--progress-bar-fill-low); /\* Default low \*/  
            transition: width 0.5s ease-out, background-color 0.5s ease-out;  
            display: flex;  
            align-items: center;  
            justify-content: flex-end;  
            padding-right: 10px;  
            box-sizing: border-box;  
            color: white;  
            font-weight: bold;  
            font-size: 0.9em;  
            text-shadow: 1px 1px 2px rgba(0,0,0,0.2);  
        }

        .progress-bar-value {  
            min-width: 100px;  
            text-align: right;  
            font-weight: 500;  
        }

        .button-group {  
            text-align: center;  
            margin-top: 30px;  
        }

        .button-group button {  
            padding: 12px 25px;  
            background-color: var(--accent-color);  
            color: var(--text-color);  
            border: none;  
            border-radius: 8px;  
            cursor: pointer;  
            font-size: 1.1em;  
            font-weight: 500;  
            transition: background-color 0.3s ease, transform 0.2s ease;  
        }

        .button-group button:hover {  
            background-color: \#FFB300;  
            transform: translateY(-2px);  
        }

        /\* Responsive adjustments \*/  
        @media (max-width: 768px) {  
            .container {  
                padding: 20px;  
            }

            .meal-builder-controls {  
                grid-template-columns: 1fr;  
            }

            .tabs {  
                flex-wrap: wrap;  
            }

            .tab-button {  
                flex-basis: 48%;  
                margin-bottom: 10px;  
            }

            .progress-bar-container {  
                flex-direction: column;  
                align-items: flex-start;  
                gap: 5px;  
            }

            .progress-bar-label {  
                margin-bottom: 5px;  
            }  
        }  
    \</style\>  
\</head\>  
\<body\>  
    \<div class="container"\>  
        \<h1\>Interactive Meal Macro Planner\</h1\>

        \<div class="section" id="set-targets-section"\>  
            \<h2\>Step 1: Set Your Daily Macro Targets (in grams)\</h2\>  
            \<div class="input-group"\>  
                \<label for="proteinTarget"\>Protein Target (g)\</label\>  
                \<input type="number" id="proteinTarget" placeholder="e.g., 150" value="150"\>  
            \</div\>  
            \<div class="input-group"\>  
                \<label for="carbTarget"\>Carbohydrate Target (g)\</label\>  
                \<input type="number" id="carbTarget" placeholder="e.g., 100" value="100"\>  
            \</div\>  
            \<div class="input-group"\>  
                \<label for="fatTarget"\>Fat Target (g)\</label\>  
                \<input type="number" id="fatTarget" placeholder="e.g., 70" value="70"\>  
            \</div\>  
            \<p class="helper-text"\>You can find these numbers using our main Metabolic Calculator. These are your targets for the entire day.\</p\>  
        \</div\>

        \<div class="section" id="meal-builder-section"\>  
            \<h2\>Step 2: Build Your Meals\</h2\>  
            \<div class="tabs"\>  
                \<button class="tab-button active" data-meal="Breakfast"\>Breakfast\</button\>  
                \<button class="tab-button" data-meal="Lunch"\>Lunch\</button\>  
                \<button class="tab-button" data-meal="Dinner"\>Dinner\</button\>  
                \<button class="tab-button" data-meal="Snacks"\>Snacks\</button\>  
            \</div\>

            \<div id="meal-content-Breakfast" class="tab-content active"\>  
                \<h3\>Add Food to Breakfast\</h3\>  
                \<div class="meal-builder-controls"\>  
                    \<div class="input-group"\>  
                        \<label for="foodSelectBreakfast"\>Select a Food\</label\>  
                        \<select id="foodSelectBreakfast"\>\</select\>  
                    \</div\>  
                    \<div class="input-group"\>  
                        \<label for="servingSizeBreakfast"\>Serving Size (in grams)\</label\>  
                        \<input type="number" id="servingSizeBreakfast" placeholder="e.g., 100" value="100"\>  
                    \</div\>  
                    \<button id="addFoodBreakfast"\>Add Food\</button\>  
                \</div\>  
                  
                \<div class="current-meal-items"\>  
                    \<h3\>Current Breakfast Items\</h3\>  
                    \<ul id="mealListBreakfast"\>\</ul\>  
                \</div\>

                \<div class="macro-tracker"\>  
                    \<h3\>Live Breakfast Macro Tracker\</h3\>  
                    \<div class="progress-bar-container"\>  
                        \<span class="progress-bar-label"\>Protein:\</span\>  
                        \<div class="progress-bar-wrapper"\>  
                            \<div class="progress-bar-fill" id="pbFillBreakfastProtein"\>\</div\>  
                        \</div\>  
                        \<span class="progress-bar-value" id="pbValueBreakfastProtein"\>0g / 0g\</span\>  
                    \</div\>  
                    \<div class="progress-bar-container"\>  
                        \<span class="progress-bar-label"\>Carbohydrates:\</span\>  
                        \<div class="progress-bar-wrapper"\>  
                            \<div class="progress-bar-fill" id="pbFillBreakfastCarbs"\>\</div\>  
                        \</div\>  
                        \<span class="progress-bar-value" id="pbValueBreakfastCarbs"\>0g / 0g\</span\>  
                    \</div\>  
                    \<div class="progress-bar-container"\>  
                        \<span class="progress-bar-label"\>Fat:\</span\>  
                        \<div class="progress-bar-wrapper"\>  
                            \<div class="progress-bar-fill" id="pbFillBreakfastFat"\>\</div\>  
                        \</div\>  
                        \<span class="progress-bar-value" id="pbValueBreakfastFat"\>0g / 0g\</span\>  
                    \</div\>  
                \</div\>  
            \</div\>

            \<div id="meal-content-Lunch" class="tab-content"\>  
                \<\!-- Repeated structure for Lunch \--\>  
                \<h3\>Add Food to Lunch\</h3\>  
                \<div class="meal-builder-controls"\>  
                    \<div class="input-group"\>  
                        \<label for="foodSelectLunch"\>Select a Food\</label\>  
                        \<select id="foodSelectLunch"\>\</select\>  
                    \</div\>  
                    \<div class="input-group"\>  
                        \<label for="servingSizeLunch"\>Serving Size (in grams)\</label\>  
                        \<input type="number" id="servingSizeLunch" placeholder="e.g., 100" value="100"\>  
                    \</div\>  
                    \<button id="addFoodLunch"\>Add Food\</button\>  
                \</div\>  
                \<div class="current-meal-items"\>  
                    \<h3\>Current Lunch Items\</h3\>  
                    \<ul id="mealListLunch"\>\</ul\>  
                \</div\>  
                \<div class="macro-tracker"\>  
                    \<h3\>Live Lunch Macro Tracker\</h3\>  
                    \<div class="progress-bar-container"\>\<span class="progress-bar-label"\>Protein:\</span\>\<div class="progress-bar-wrapper"\>\<div class="progress-bar-fill" id="pbFillLunchProtein"\>\</div\>\</div\>\<span class="progress-bar-value" id="pbValueLunchProtein"\>0g / 0g\</span\>\</div\>  
                    \<div class="progress-bar-container"\>\<span class="progress-bar-label"\>Carbohydrates:\</span\>\<div class="progress-bar-wrapper"\>\<div class="progress-bar-fill" id="pbFillLunchCarbs"\>\</div\>\</div\>\<span class="progress-bar-value" id="pbValueLunchCarbs"\>0g / 0g\</span\>\</div\>  
                    \<div class="progress-bar-container"\>\<span class="progress-bar-label"\>Fat:\</span\>\<div class="progress-bar-wrapper"\>\<div class="progress-bar-fill" id="pbFillLunchFat"\>\</div\>\</div\>\<span class="progress-bar-value" id="pbValueLunchFat"\>0g / 0g\</span\>\</div\>  
                \</div\>  
            \</div\>

            \<div id="meal-content-Dinner" class="tab-content"\>  
                \<\!-- Repeated structure for Dinner \--\>  
                \<h3\>Add Food to Dinner\</h3\>  
                \<div class="meal-builder-controls"\>  
                    \<div class="input-group"\>  
                        \<label for="foodSelectDinner"\>Select a Food\</label\>  
                        \<select id="foodSelectDinner"\>\</select\>  
                    \</div\>  
                    \<div class="input-group"\>  
                        \<label for="servingSizeDinner"\>Serving Size (in grams)\</label\>  
                        \<input type="number" id="servingSizeDinner" placeholder="e.g., 100" value="100"\>  
                    \</div\>  
                    \<button id="addFoodDinner"\>Add Food\</button\>  
                \</div\>  
                \<div class="current-meal-items"\>  
                    \<h3\>Current Dinner Items\</h3\>  
                    \<ul id="mealListDinner"\>\</ul\>  
                \</div\>  
                \<div class="macro-tracker"\>  
                    \<h3\>Live Dinner Macro Tracker\</h3\>  
                    \<div class="progress-bar-container"\>\<span class="progress-bar-label"\>Protein:\</span\>\<div class="progress-bar-wrapper"\>\<div class="progress-bar-fill" id="pbFillDinnerProtein"\>\</div\>\</div\>\<span class="progress-bar-value" id="pbValueDinnerProtein"\>0g / 0g\</span\>\</div\>  
                    \<div class="progress-bar-container"\>\<span class="progress-bar-label"\>Carbohydrates:\</span\>\<div class="progress-bar-wrapper"\>\<div class="progress-bar-fill" id="pbFillDinnerCarbs"\>\</div\>\</div\>\<span class="progress-bar-value" id="pbValueDinnerCarbs"\>0g / 0g\</span\>\</div\>  
                    \<div class="progress-bar-container"\>\<span class="progress-bar-label"\>Fat:\</span\>\<div class="progress-bar-wrapper"\>\<div class="progress-bar-fill" id="pbFillDinnerFat"\>\</div\>\</div\>\<span class="progress-bar-value" id="pbValueDinnerFat"\>0g / 0g\</span\>\</div\>  
                \</div\>  
            \</div\>

            \<div id="meal-content-Snacks" class="tab-content"\>  
                \<\!-- Repeated structure for Snacks \--\>  
                \<h3\>Add Food to Snacks\</h3\>  
                \<div class="meal-builder-controls"\>  
                    \<div class="input-group"\>  
                        \<label for="foodSelectSnacks"\>Select a Food\</label\>  
                        \<select id="foodSelectSnacks"\>\</select\>  
                    \</div\>  
                    \<div class="input-group"\>  
                        \<label for="servingSizeSnacks"\>Serving Size (in grams)\</label\>  
                        \<input type="number" id="servingSizeSnacks" placeholder="e.g., 50" value="50"\>  
                    \</div\>  
                    \<button id="addFoodSnacks"\>Add Food\</button\>  
                \</div\>  
                \<div class="current-meal-items"\>  
                    \<h3\>Current Snacks Items\</h3\>  
                    \<ul id="mealListSnacks"\>\</ul\>  
                \</div\>  
                \<div class="macro-tracker"\>  
                    \<h3\>Live Snacks Macro Tracker\</h3\>  
                    \<div class="progress-bar-container"\>\<span class="progress-bar-label"\>Protein:\</span\>\<div class="progress-bar-wrapper"\>\<div class="progress-bar-fill" id="pbFillSnacksProtein"\>\</div\>\</div\>\<span class="progress-bar-value" id="pbValueSnacksProtein"\>0g / 0g\</span\>\</div\>  
                    \<div class="progress-bar-container"\>\<span class="progress-bar-label"\>Carbohydrates:\</span\>\<div class="progress-bar-wrapper"\>\<div class="progress-bar-fill" id="pbFillSnacksCarbs"\>\</div\>\</div\>\<span class="progress-bar-value" id="pbValueSnacksCarbs"\>0g / 0g\</span\>\</div\>  
                    \<div class="progress-bar-container"\>\<span class="progress-bar-label"\>Fat:\</span\>\<div class="progress-bar-wrapper"\>\<div class="progress-bar-fill" id="pbFillSnacksFat"\>\</div\>\</div\>\<span class="progress-bar-value" id="pbValueSnacksFat"\>0g / 0g\</span\>\</div\>  
                \</div\>  
            \</div\>  
        \</div\>

        \<div class="section" id="daily-summary-section"\>  
            \<h2\>Your Daily Progress\</h2\>  
            \<div class="macro-tracker"\>  
                \<div class="progress-bar-container"\>  
                    \<span class="progress-bar-label"\>Total Daily Protein:\</span\>  
                    \<div class="progress-bar-wrapper"\>  
                        \<div class="progress-bar-fill" id="pbFillDailyProtein"\>\</div\>  
                    \</div\>  
                    \<span class="progress-bar-value" id="pbValueDailyProtein"\>0g / 0g\</span\>  
                \</div\>  
                \<div class="progress-bar-container"\>  
                    \<span class="progress-bar-label"\>Total Daily Carbohydrates:\</span\>  
                    \<div class="progress-bar-wrapper"\>  
                        \<div class="progress-bar-fill" id="pbFillDailyCarbs"\>\</div\>  
                    \</div\>  
                    \<span class="progress-bar-value" id="pbValueDailyCarbs"\>0g / 0g\</span\>  
                \</div\>  
                \<div class="progress-bar-container"\>  
                    \<span class="progress-bar-label"\>Total Daily Fat:\</span\>  
                    \<div class="progress-bar-wrapper"\>  
                        \<div class="progress-bar-fill" id="pbFillDailyFat"\>\</div\>  
                    \</div\>  
                    \<span class="progress-bar-value" id="pbValueDailyFat"\>0g / 0g\</span\>  
                \</div\>  
            \</div\>  
            \<div class="button-group"\>  
                \<button id="clearDayButton"\>Clear Day / Reset All\</button\>  
            \</div\>  
        \</div\>  
    \</div\>

    \<script\>  
        // \--- COMPREHENSIVE FOOD DATABASE \---  
        // Values are per 100g  
        const foodDatabase \= \[  
            // Proteins  
            { name: 'Chicken Breast (skinless, cooked)', protein: 31, carbs: 0, fat: 3.6 },  
            { name: 'Turkey Breast (cooked)', protein: 29, carbs: 0, fat: 3.6 },  
            { name: 'Ground Turkey (93/7, cooked)', protein: 27, carbs: 0, fat: 11 },  
            { name: 'Salmon (cooked)', protein: 25, carbs: 0, fat: 15 },  
            { name: 'Mackerel (cooked)', protein: 24, carbs: 0, fat: 18 },  
            { name: 'Sardines (in oil, drained)', protein: 25, carbs: 0, fat: 11 },  
            { name: 'Cod (cooked)', protein: 23, carbs: 0, fat: 0.9 },  
            { name: 'Tuna (canned in water, drained)', protein: 23, carbs: 0, fat: 1 },  
            { name: 'Mahi-Mahi (cooked)', protein: 24, carbs: 0, fat: 1 },  
            { name: 'Snapper (cooked)', protein: 26, carbs: 0, fat: 1.7 },  
            { name: 'Shrimp (cooked)', protein: 24, carbs: 0.2, fat: 0.3 },  
            { name: 'Scallops (cooked)', protein: 23, carbs: 5, fat: 1 },  
            { name: 'Lean Beef (Sirloin, grass-fed, cooked)', protein: 29, carbs: 0, fat: 7 },  
            { name: 'Eggs (large, whole)', protein: 13, carbs: 1.1, fat: 11 },  
            { name: 'Tofu (firm)', protein: 17, carbs: 2.8, fat: 9 },  
            { name: 'Tempeh', protein: 19, carbs: 9, fat: 11 },  
            { name: 'Edamame (shelled, cooked)', protein: 11, carbs: 10, fat: 5 },  
            { name: 'Lentils (cooked)', protein: 9, carbs: 20, fat: 0.4 },  
            { name: 'Black Beans (cooked)', protein: 8, carbs: 24, fat: 0.5 },  
            { name: 'Chickpeas (Garbanzos, cooked)', protein: 9, carbs: 27, fat: 2.6 },  
            { name: 'Kidney Beans (cooked)', protein: 8, carbs: 23, fat: 0.5 },  
            { name: 'Navy Beans (cooked)', protein: 8, carbs: 24, fat: 0.6 },  
            { name: 'Pinto Beans (cooked)', protein: 9, carbs: 26, fat: 0.6 },  
            { name: 'Cottage Cheese (2% fat)', protein: 11, carbs: 3.4, fat: 2.3 },  
            { name: 'Plain Greek Yogurt (0% fat)', protein: 10, carbs: 4, fat: 0.4 },  
            { name: 'Whey Protein Powder', protein: 80, carbs: 5, fat: 5 },  
            { name: 'Pea Protein Powder', protein: 78, carbs: 3, fat: 8 },  
            // Fats  
            { name: 'Avocado', protein: 2, carbs: 9, fat: 15 },  
            { name: 'Almonds', protein: 21, carbs: 22, fat: 49 },  
            { name: 'Walnuts', protein: 15, carbs: 14, fat: 65 },  
            { name: 'Pecans', protein: 9, carbs: 14, fat: 72 },  
            { name: 'Brazil Nuts', protein: 14, carbs: 12, fat: 66 },  
            { name: 'Cashews', protein: 18, carbs: 30, fat: 44 },  
            { name: 'Pistachios', protein: 20, carbs: 28, fat: 45 },  
            { name: 'Hazelnuts', protein: 15, carbs: 17, fat: 61 },  
            { name: 'Chia Seeds', protein: 17, carbs: 42, fat: 31 },  
            { name: 'Flax Seeds (ground)', protein: 18, carbs: 29, fat: 42 },  
            { name: 'Hemp Seeds (hulled)', protein: 31, carbs: 9, fat: 49 },  
            { name: 'Pumpkin Seeds', protein: 30, carbs: 11, fat: 49 },  
            { name: 'Sunflower Seeds', protein: 21, carbs: 20, fat: 51 },  
            { name: 'Sesame Seeds', protein: 18, carbs: 23, fat: 50 },  
            { name: 'Almond Butter (no added sugar)', protein: 21, carbs: 21, fat: 50 },  
            { name: 'Peanut Butter (no added sugar)', protein: 25, carbs: 20, fat: 50 },  
            { name: 'Extra Virgin Olive Oil', protein: 0, carbs: 0, fat: 100 },  
            { name: 'Avocado Oil', protein: 0, carbs: 0, fat: 100 },  
            { name: 'Coconut Oil', protein: 0, carbs: 0, fat: 100 },  
            { name: 'Ghee', protein: 0.3, carbs: 0, fat: 99.5 },  
            { name: 'Olives (Kalamata)', protein: 1.5, carbs: 6, fat: 27 },  
            // Vegetables  
            { name: 'Spinach', protein: 2.9, carbs: 3.6, fat: 0.4 },  
            { name: 'Kale', protein: 3.3, carbs: 5.2, fat: 1.5 },  
            { name: 'Collard Greens (cooked)', protein: 3, carbs: 5.6, fat: 0.7 },  
            { name: 'Swiss Chard (cooked)', protein: 1.9, carbs: 4, fat: 0.1 },  
            { name: 'Romaine Lettuce', protein: 1.2, carbs: 3.3, fat: 0.3 },  
            { name: 'Arugula', protein: 2.6, carbs: 3.7, fat: 0.7 },  
            { name: 'Broccoli', protein: 2.8, carbs: 7, fat: 0.4 },  
            { name: 'Cauliflower', protein: 1.9, carbs: 5, fat: 0.3 },  
            { name: 'Brussels Sprouts (cooked)', protein: 2.5, carbs: 7, fat: 0.5 },  
            { name: 'Cabbage', protein: 1.3, carbs: 6, fat: 0.1 },  
            { name: 'Bell Peppers (Red)', protein: 1, carbs: 6, fat: 0.3 },  
            { name: 'Zucchini', protein: 1.2, carbs: 3.1, fat: 0.3 },  
            { name: 'Cucumber', protein: 0.7, carbs: 3.6, fat: 0.1 },  
            { name: 'Tomatoes', protein: 0.9, carbs: 3.9, fat: 0.2 },  
            { name: 'Asparagus', protein: 2.2, carbs: 3.9, fat: 0.2 },  
            { name: 'Green Beans (cooked)', protein: 1.9, carbs: 7, fat: 0.3 },  
            { name: 'Mushrooms (White, cooked)', protein: 3.9, carbs: 4.4, fat: 0.2 },  
            { name: 'Onions', protein: 1.1, carbs: 9.3, fat: 0.1 },  
            { name: 'Garlic', protein: 6.4, carbs: 33, fat: 0.5 },  
            { name: 'Eggplant (cooked)', protein: 0.8, carbs: 8.7, fat: 0.2 },  
            { name: 'Okra (cooked)', protein: 2, carbs: 7.6, fat: 0.3 },  
            { name: 'Celery', protein: 0.7, carbs: 3, fat: 0.2 },  
            // Low-Glycemic Fruits  
            { name: 'Strawberries', protein: 0.7, carbs: 8, fat: 0.3 },  
            { name: 'Blueberries', protein: 0.7, carbs: 14, fat: 0.3 },  
            { name: 'Raspberries', protein: 1.2, carbs: 12, fat: 0.7 },  
            { name: 'Blackberries', protein: 1.4, carbs: 10, fat: 0.5 },  
            { name: 'Cherries', protein: 1, carbs: 16, fat: 0.3 },  
            { name: 'Apple (with skin)', protein: 0.3, carbs: 14, fat: 0.2 },  
            { name: 'Pear (with skin)', protein: 0.4, carbs: 15, fat: 0.1 },  
            { name: 'Orange', protein: 0.9, carbs: 12, fat: 0.1 },  
            { name: 'Grapefruit', protein: 0.8, carbs: 11, fat: 0.1 },  
            { name: 'Kiwi', protein: 1.1, carbs: 15, fat: 0.5 },  
            { name: 'Plums', protein: 0.7, carbs: 11, fat: 0.3 },  
            { name: 'Peaches', protein: 0.9, carbs: 10, fat: 0.3 },  
            { name: 'Apricots', protein: 1.4, carbs: 11, fat: 0.4 },  
            // Starchy Veggies & Whole Grains (in moderation)  
            { name: 'Oats (Rolled, dry)', protein: 17, carbs: 66, fat: 7 },  
            { name: 'Quinoa (cooked)', protein: 4.4, carbs: 21.3, fat: 1.9 },  
            { name: 'Brown Rice (cooked)', protein: 2.6, carbs: 23, fat: 0.9 },  
            { name: 'Wild Rice (cooked)', protein: 4, carbs: 21, fat: 0.3 },  
            { name: 'Barley (pearled, cooked)', protein: 2.3, carbs: 28, fat: 0.4 },  
            { name: 'Sweet Potatoes (baked)', protein: 2, carbs: 27, fat: 0.2 },  
            { name: 'Yams (cooked)', protein: 1.5, carbs: 27, fat: 0.2 },  
            { name: 'Cassava (Yuca, cooked)', protein: 1.4, carbs: 38, fat: 0.3 },  
            { name: 'Green Plantains (cooked)', protein: 1.3, carbs: 32, fat: 0.4 },  
            { name: 'Ezekiel Bread (1 slice)', protein: 5, carbs: 15, fat: 0.5 },  
            // Dairy & Alternatives  
            { name: 'Unsweetened Almond Milk', protein: 0.4, carbs: 0.6, fat: 1.1 },  
            { name: 'Unsweetened Soy Milk', protein: 2.9, carbs: 1.5, fat: 1.6 },  
            { name: 'Kefir (plain)', protein: 3.3, carbs: 4, fat: 3.3 },  
            { name: 'Feta Cheese', protein: 14, carbs: 4.1, fat: 21 }  
        \];

        // \--- GLOBAL STATE MANAGEMENT \---  
        const mealMacros \= {};  
        const mealNames \= \['Breakfast', 'Lunch', 'Dinner', 'Snacks'\];  
        let dailyTargets \= {};  
        let activeMeal \= 'Breakfast';

        // \--- DOM ELEMENTS \---  
        const proteinTargetInput \= document.getElementById('proteinTarget');  
        const carbTargetInput \= document.getElementById('carbTarget');  
        const fatTargetInput \= document.getElementById('fatTarget');  
        const tabButtons \= document.querySelectorAll('.tab-button');  
        const tabContents \= document.querySelectorAll('.tab-content');  
        const clearDayButton \= document.getElementById('clearDayButton');

        // \--- INITIALIZATION \---  
        function initializeApp() {  
            mealNames.forEach(meal \=\> {  
                resetMeal(meal);  
                const addButton \= document.getElementById(\`addFood${meal}\`);  
                addButton.addEventListener('click', () \=\> addFood(meal));  
            });  
            populateFoodDropdowns();  
            updateTargets();  
            switchTab(activeMeal);  
            addEventListeners();  
        }

        function resetMeal(mealName) {  
            mealMacros\[mealName\] \= { protein: 0, carbs: 0, fat: 0, items: \[\] };  
        }

        function populateFoodDropdowns() {  
            const foodSelects \= document.querySelectorAll('\[id^="foodSelect"\]');  
            const sortedFoodDatabase \= \[...foodDatabase\].sort((a, b) \=\> a.name.localeCompare(b.name));  
              
            foodSelects.forEach(select \=\> {  
                select.innerHTML \= '';  
                const defaultOption \= document.createElement('option');  
                defaultOption.value \= '';  
                defaultOption.textContent \= '--- Select a Food \---';  
                defaultOption.disabled \= true;  
                defaultOption.selected \= true;  
                select.appendChild(defaultOption);

                sortedFoodDatabase.forEach(food \=\> {  
                    const option \= document.createElement('option');  
                    option.value \= food.name;  
                    option.textContent \= food.name;  
                    select.appendChild(option);  
                });  
            });  
        }

        function addEventListeners() {  
            proteinTargetInput.addEventListener('input', updateTargets);  
            carbTargetInput.addEventListener('input', updateTargets);  
            fatTargetInput.addEventListener('input', updateTargets);  
            tabButtons.forEach(button \=\> button.addEventListener('click', () \=\> switchTab(button.dataset.meal)));  
            clearDayButton.addEventListener('click', clearAllData);  
        }

        // \--- CORE LOGIC \---  
        function updateTargets() {  
            dailyTargets.protein \= parseFloat(proteinTargetInput.value) || 0;  
            dailyTargets.carbs \= parseFloat(carbTargetInput.value) || 0;  
            dailyTargets.fat \= parseFloat(fatTargetInput.value) || 0;  
            updateAllProgressBars();  
        }  
          
        function calculateMealTargets() {  
            // Meal target is roughly 1/3.5 for B/L/D to leave a buffer for snacks.  
            const mainMealDivisor \= 3.5;  
            return {  
                protein: dailyTargets.protein / mainMealDivisor,  
                carbs: dailyTargets.carbs / mainMealDivisor,  
                fat: dailyTargets.fat / mainMealDivisor  
            };  
        }

        function addFood(mealType) {  
            const foodSelect \= document.getElementById(\`foodSelect${mealType}\`);  
            const servingSizeInput \= document.getElementById(\`servingSize${mealType}\`);

            const selectedFoodName \= foodSelect.value;  
            const servingSize \= parseFloat(servingSizeInput.value);

            if (\!selectedFoodName || \!servingSize || servingSize \<= 0\) {  
                alert('Please select a food and enter a valid serving size.');  
                return;  
            }

            const food \= foodDatabase.find(f \=\> f.name \=== selectedFoodName);  
            const multiplier \= servingSize / 100;  
            const calculatedMacros \= {  
                protein: (food.protein || 0\) \* multiplier,  
                carbs: (food.carbs || 0\) \* multiplier,  
                fat: (food.fat || 0\) \* multiplier  
            };

            const meal \= mealMacros\[mealType\];  
            meal.protein \+= calculatedMacros.protein;  
            meal.carbs \+= calculatedMacros.carbs;  
            meal.fat \+= calculatedMacros.fat;  
            meal.items.push({ name: food.name, serving: servingSize, macros: calculatedMacros });

            renderMealList(mealType);  
            updateAllProgressBars();

            servingSizeInput.value \= '100';  
            foodSelect.value \= '';  
        }

        function removeFood(mealType, index) {  
            const meal \= mealMacros\[mealType\];  
            const removedItem \= meal.items.splice(index, 1)\[0\];  
              
            meal.protein \-= removedItem.macros.protein;  
            meal.carbs \-= removedItem.macros.carbs;  
            meal.fat \-= removedItem.macros.fat;

            renderMealList(mealType);  
            updateAllProgressBars();  
        }

        function clearAllData() {  
            if (\!confirm('Are you sure you want to clear all data and reset the planner?')) {  
                return;  
            }  
            proteinTargetInput.value \= '150';  
            carbTargetInput.value \= '100';  
            fatTargetInput.value \= '70';  
            mealNames.forEach(meal \=\> {  
                resetMeal(meal);  
                renderMealList(meal);  
            });  
            updateTargets();  
        }

        // \--- UI / RENDERING LOGIC \---  
        function switchTab(mealType) {  
            tabButtons.forEach(button \=\> button.classList.toggle('active', button.dataset.meal \=== mealType));  
            tabContents.forEach(content \=\> content.classList.toggle('active', content.id \=== \`meal-content-${mealType}\`));  
            activeMeal \= mealType;  
            renderMealList(activeMeal);  
            updateAllProgressBars();  
        }

        function renderMealList(mealType) {  
            const mealListElement \= document.getElementById(\`mealList${mealType}\`);  
            mealListElement.innerHTML \= '';  
            mealMacros\[mealType\].items.forEach((item, index) \=\> {  
                const listItem \= document.createElement('li');  
                listItem.innerHTML \= \`\<span\>${item.name} (${item.serving}g)\</span\>\<button data-index="${index}"\>Remove\</button\>\`;  
                mealListElement.appendChild(listItem);  
            });  
            mealListElement.querySelectorAll('button').forEach(button \=\> {  
                button.addEventListener('click', (event) \=\> removeFood(mealType, parseInt(event.target.dataset.index)));  
            });  
        }

        function updateAllProgressBars() {  
            const mealTargets \= calculateMealTargets();  
              
            mealNames.forEach(meal \=\> {  
                const isSnack \= meal \=== 'Snacks';  
                // For snacks, the target can be considered the remaining daily amount, or just not have a strict target.  
                // For simplicity in display, we will use the same meal targets for snacks progress bar, but it mostly contributes to the daily total.  
                updateProgressBar(\`pbFill${meal}Protein\`, \`pbValue${meal}Protein\`, mealMacros\[meal\].protein, isSnack ? dailyTargets.protein : mealTargets.protein);  
                updateProgressBar(\`pbFill${meal}Carbs\`, \`pbValue${meal}Carbs\`, mealMacros\[meal\].carbs, isSnack ? dailyTargets.carbs : mealTargets.carbs);  
                updateProgressBar(\`pbFill${meal}Fat\`, \`pbValue${meal}Fat\`, mealMacros\[meal\].fat, isSnack ? dailyTargets.fat : mealTargets.fat);  
            });

            let totalDailyProtein \= 0, totalDailyCarbs \= 0, totalDailyFat \= 0;  
            for (const meal in mealMacros) {  
                totalDailyProtein \+= mealMacros\[meal\].protein;  
                totalDailyCarbs \+= mealMacros\[meal\].carbs;  
                totalDailyFat \+= mealMacros\[meal\].fat;  
            }

            updateProgressBar('pbFillDailyProtein', 'pbValueDailyProtein', totalDailyProtein, dailyTargets.protein);  
            updateProgressBar('pbFillDailyCarbs', 'pbValueDailyCarbs', totalDailyCarbs, dailyTargets.carbs);  
            updateProgressBar('pbFillDailyFat', 'pbValueDailyFat', totalDailyFat, dailyTargets.fat);  
        }

        function updateProgressBar(fillId, valueId, current, target) {  
            const fillElement \= document.getElementById(fillId);  
            const valueElement \= document.getElementById(valueId);

            const percentage \= target \> 0 ? (current / target) \* 100 : 0;  
            const cappedPercentage \= Math.min(percentage, 100);

            fillElement.style.width \= \`${cappedPercentage}%\`;  
            valueElement.textContent \= \`${current.toFixed(0)}g / ${target.toFixed(0)}g\`;

            if (percentage \>= 100\) fillElement.style.backgroundColor \= 'var(--progress-bar-fill-high)';  
            else if (percentage \>= 75\) fillElement.style.backgroundColor \= 'var(--progress-bar-fill-medium)';  
            else fillElement.style.backgroundColor \= 'var(--progress-bar-fill-low)';  
              
            if (current \> target && target \> 0\) fillElement.style.backgroundColor \= 'var(--progress-bar-fill-over)';

            fillElement.textContent \= percentage \> 20 ? \`${current.toFixed(0)}g\` : '';  
        }

        // \--- APP START \---  
        document.addEventListener('DOMContentLoaded', initializeApp);

    \</script\>  
\</body\>  
\</html\>

Metabolic symptom and risk analyzer

\<\!DOCTYPE html\>  
\<html lang="en"\>  
\<head\>  
    \<meta charset="UTF-8"\>  
    \<meta name="viewport" content="width=device-width, initial-scale=1.0"\>  
    \<title\>Metabolic Symptom & Risk Analyzer\</title\>  
    \<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700\&display=swap" rel="stylesheet"\>  
    \<style\>  
        :root {  
            \--primary-color: \#2c3e50;  
            \--secondary-color: \#3498db;  
            \--accent-color: \#e74c3c;  
            \--success-color: \#2ecc71;  
            \--warning-color: \#f39c12;  
            \--danger-color: \#e74c3c;  
            \--text-color: \#333;  
            \--bg-color: \#f9f9f9;  
            \--card-bg: \#ffffff;  
            \--border-color: \#ddd;  
            \--shadow-light: rgba(0, 0, 0, 0.05);  
            \--shadow-medium: rgba(0, 0, 0, 0.1);  
        }

        body {  
            font-family: 'Roboto', sans-serif;  
            line-height: 1.6;  
            color: var(--text-color);  
            background-color: var(--bg-color);  
            margin: 0;  
            padding: 20px;  
            display: flex;  
            justify-content: center;  
            align-items: flex-start;  
            min-height: 100vh;  
            box-sizing: border-box;  
        }

        .container {  
            background-color: var(--card-bg);  
            border-radius: 12px;  
            box-shadow: 0 10px 30px var(--shadow-medium);  
            padding: 40px;  
            max-width: 800px;  
            width: 100%;  
            text-align: center;  
            box-sizing: border-box;  
        }

        h1 {  
            color: var(--primary-color);  
            font-size: 2.5em;  
            margin-bottom: 20px;  
            font-weight: 700;  
        }

        h2 {  
            color: var(--secondary-color);  
            font-size: 1.8em;  
            margin-top: 30px;  
            margin-bottom: 20px;  
            font-weight: 500;  
        }

        h3 {  
            color: var(--primary-color);  
            font-size: 1.4em;  
            margin-top: 25px;  
            margin-bottom: 15px;  
        }

        .quiz-section {  
            display: none;  
            text-align: left;  
            padding: 20px 0;  
        }

        .quiz-section.active {  
            display: block;  
        }

        .question-group {  
            margin-bottom: 30px;  
            padding: 20px;  
            border: 1px solid var(--border-color);  
            border-radius: 8px;  
            background-color: \#fefefe;  
        }

        .question {  
            margin-bottom: 20px;  
            font-size: 1.1em;  
            color: var(--primary-color);  
            font-weight: 400;  
        }

        .question label {  
            display: block;  
            margin-bottom: 10px;  
        }

        .question input\[type="radio"\],  
        .question input\[type="text"\],  
        .question select {  
            margin-right: 8px;  
            padding: 10px;  
            border: 1px solid var(--border-color);  
            border-radius: 5px;  
            width: calc(100% \- 22px);  
            box-sizing: border-box;  
            font-size: 1em;  
        }

        .question input\[type="radio"\] {  
            width: auto;  
        }

        .question input\[type="text"\]:focus,  
        .question select:focus {  
            outline: none;  
            border-color: var(--secondary-color);  
            box-shadow: 0 0 5px rgba(52, 152, 219, 0.3);  
        }

        .radio-group label {  
            display: inline-block;  
            margin-right: 20px;  
            cursor: pointer;  
            font-weight: normal;  
        }

        .buttons {  
            display: flex;  
            justify-content: space-between;  
            margin-top: 30px;  
        }

        button {  
            background-color: var(--secondary-color);  
            color: white;  
            padding: 12px 25px;  
            border: none;  
            border-radius: 8px;  
            cursor: pointer;  
            font-size: 1.1em;  
            transition: background-color 0.3s ease, transform 0.2s ease;  
            box-shadow: 0 4px 10px var(--shadow-light);  
        }

        button:hover {  
            background-color: \#2980b9;  
            transform: translateY(-2px);  
        }

        button:active {  
            transform: translateY(0);  
        }

        button:disabled {  
            background-color: \#cccccc;  
            cursor: not-allowed;  
            box-shadow: none;  
        }

        \#prevBtn {  
            background-color: \#95a5a6;  
        }

        \#prevBtn:hover {  
            background-color: \#7f8c8d;  
        }

        .results-section {  
            display: none;  
            text-align: left;  
            padding: 30px;  
            border-radius: 12px;  
            margin-top: 30px;  
            box-shadow: 0 5px 20px var(--shadow-medium);  
        }

        .results-section h2 {  
            font-size: 2.2em;  
            margin-bottom: 20px;  
        }

        .results-section p {  
            font-size: 1.1em;  
            margin-bottom: 15px;  
            color: var(--text-color);  
        }

        .results-section ul {  
            list-style-type: none;  
            padding: 0;  
            margin-top: 20px;  
        }

        .results-section ul li {  
            background-color: var(--bg-color);  
            margin-bottom: 10px;  
            padding: 15px 20px;  
            border-left: 5px solid var(--secondary-color);  
            border-radius: 5px;  
            font-size: 1.05em;  
        }

        .disclaimer {  
            font-size: 0.9em;  
            color: \#777;  
            margin-top: 30px;  
            border-top: 1px solid var(--border-color);  
            padding-top: 20px;  
        }

        .low-risk { border: 2px solid var(--success-color); background-color: \#e9f9f0; }  
        .low-risk h2 { color: var(--success-color); }  
        .low-risk ul li { border-left-color: var(--success-color); }

        .moderate-risk { border: 2px solid var(--warning-color); background-color: \#fff8e6; }  
        .moderate-risk h2 { color: var(--warning-color); }  
        .moderate-risk ul li { border-left-color: var(--warning-color); }

        .high-risk { border: 2px solid var(--danger-color); background-color: \#ffebeb; }  
        .high-risk h2 { color: var(--danger-color); }  
        .high-risk ul li { border-left-color: var(--danger-color); }

        /\* Responsive Design \*/  
        @media (max-width: 768px) {  
            .container {  
                padding: 20px;  
                margin: 10px;  
            }

            h1 {  
                font-size: 2em;  
            }

            h2 {  
                font-size: 1.5em;  
            }

            button {  
                padding: 10px 20px;  
                font-size: 1em;  
            }

            .buttons {  
                flex-direction: column;  
                gap: 15px;  
            }

            \#prevBtn, \#nextBtn, \#submitBtn {  
                width: 100%;  
            }  
        }  
    \</style\>  
\</head\>  
\<body\>  
    \<div class="container"\>  
        \<h1\>Metabolic Symptom & Risk Analyzer\</h1\>  
        \<div id="quizForm"\>  
            \<div id="step1" class="quiz-section active"\>  
                \<h2\>Step 1: Energy & Cravings\</h2\>  
                \<div class="question-group"\>  
                    \<div class="question"\>  
                        \<p\>1. Do you often feel tired or need a nap after eating a carbohydrate-rich meal?\</p\>  
                        \<div class="radio-group"\>  
                            \<label\>\<input type="radio" name="q1" value="yes"\> Yes\</label\>  
                            \<label\>\<input type="radio" name="q1" value="no" checked\> No\</label\>  
                        \</div\>  
                    \</div\>  
                    \<div class="question"\>  
                        \<p\>2. Do you frequently experience strong cravings for sugar or starchy foods?\</p\>  
                        \<div class="radio-group"\>  
                            \<label\>\<input type="radio" name="q2" value="yes"\> Yes\</label\>  
                            \<label\>\<input type="radio" name="q2" value="no" checked\> No\</label\>  
                        \</div\>  
                    \</div\>  
                    \<div class="question"\>  
                        \<p\>3. Do you feel "hangry" (irritable, anxious, or shaky) if you go too long without eating?\</p\>  
                        \<div class="radio-group"\>  
                            \<label\>\<input type="radio" name="q3" value="yes"\> Yes\</label\>  
                            \<label\>\<input type="radio" name="q3" value="no" checked\> No\</label\>  
                        \</div\>  
                    \</div\>  
                \</div\>  
                \<div class="buttons"\>  
                    \<button id="prevBtn" disabled\>Previous\</button\>  
                    \<button id="nextBtn" onclick="nextStep()"\>Next\</button\>  
                \</div\>  
            \</div\>

            \<div id="step2" class="quiz-section"\>  
                \<h2\>Step 2: Physical Signs & Symptoms\</h2\>  
                \<div class="question-group"\>  
                    \<div class="question"\>  
                        \<p\>4. Is it very difficult for you to lose weight, especially from your belly area?\</p\>  
                        \<div class="radio-group"\>  
                            \<label\>\<input type="radio" name="q4" value="yes"\> Yes\</label\>  
                            \<label\>\<input type="radio" name="q4" value="no" checked\> No\</label\>  
                        \</div\>  
                    \</div\>  
                    \<div class="question"\>  
                        \<p\>5. Have you noticed any new skin tags, especially on your neck or under your arms?\</p\>  
                        \<div class="radio-group"\>  
                            \<label\>\<input type="radio" name="q5" value="yes"\> Yes\</label\>  
                            \<label\>\<input type="radio" name="q5" value="no" checked\> No\</label\>  
                        \</div\>  
                    \</div\>  
                    \<div class="question"\>  
                        \<p\>6. Have you noticed any patches of dark, velvety skin (acanthosis nigricans) on your neck, armpits, or groin?\</p\>  
                        \<div class="radio-group"\>  
                            \<label\>\<input type="radio" name="q6" value="yes"\> Yes\</label\>  
                            \<label\>\<input type="radio" name="q6" value="no" checked\> No\</label\>  
                        \</div\>  
                    \</div\>  
                \</div\>  
                \<div class="buttons"\>  
                    \<button id="prevBtn" onclick="prevStep()"\>Previous\</button\>  
                    \<button id="nextBtn" onclick="nextStep()"\>Next\</button\>  
                \</div\>  
            \</div\>

            \<div id="step3" class="quiz-section"\>  
                \<h2\>Step 3: Hormonal Health (For Female Users)\</h2\>  
                \<div class="question-group"\>  
                    \<div class="question"\>  
                        \<p\>7. Are your menstrual cycles irregular, infrequent (more than 35 days apart), or absent?\</p\>  
                        \<div class="radio-group"\>  
                            \<label\>\<input type="radio" name="q7" value="yes"\> Yes\</label\>  
                            \<label\>\<input type="radio" name="q7" value="no" checked\> No\</label\>  
                            \<label\>\<input type="radio" name="q7" value="na"\> Not Applicable\</label\>  
                        \</div\>  
                    \</div\>  
                    \<div class="question"\>  
                        \<p\>8. Do you struggle with hormonal acne, particularly along the jawline?\</p\>  
                        \<div class="radio-group"\>  
                            \<label\>\<input type="radio" name="q8" value="yes"\> Yes\</label\>  
                            \<label\>\<input type="radio" name="q8" value="no" checked\> No\</label\>  
                            \<label\>\<input type="radio" name="q8" value="na"\> Not Applicable\</label\>  
                        \</div\>  
                    \</div\>  
                    \<div class="question"\>  
                        \<p\>9. Have you experienced unwanted hair growth (hirsutism) on your face, chest, or back?\</p\>  
                        \<div class="radio-group"\>  
                            \<label\>\<input type="radio" name="q9" value="yes"\> Yes\</label\>  
                            \<label\>\<input type="radio" name="q9" value="no" checked\> No\</label\>  
                            \<label\>\<input type="radio" name="q9" value="na"\> Not Applicable\</label\>  
                        \</div\>  
                    \</div\>  
                \</div\>  
                \<div class="buttons"\>  
                    \<button id="prevBtn" onclick="prevStep()"\>Previous\</button\>  
                    \<button id="nextBtn" onclick="nextStep()"\>Next\</button\>  
                \</div\>  
            \</div\>

            \<div id="step4" class="quiz-section"\>  
                \<h2\>Step 4: Key Lab Values (Optional)\</h2\>  
                \<div class="question-group"\>  
                    \<p\>If you have recent lab results, enter them below. If not, you can leave these blank.\</p\>  
                    \<div class="question"\>  
                        \<label for="fastingGlucose"\>Fasting Glucose (mg/dL):\</label\>  
                        \<input type="number" id="fastingGlucose" name="fastingGlucose" placeholder="e.g., 90"\>  
                    \</div\>  
                    \<div class="question"\>  
                        \<label for="triglycerides"\>Triglycerides (mg/dL):\</label\>  
                        \<input type="number" id="triglycerides" name="triglycerides" placeholder="e.g., 120"\>  
                    \</div\>  
                    \<div class="question"\>  
                        \<label for="hdlCholesterol"\>HDL Cholesterol ("Good" Cholesterol) (mg/dL):\</label\>  
                        \<input type="number" id="hdlCholesterol" name="hdlCholesterol" placeholder="e.g., 55"\>  
                    \</div\>  
                    \<div class="question"\>  
                        \<p\>Are you male or female? (Needed for HDL calculation)\</p\>  
                        \<div class="radio-group"\>  
                            \<label\>\<input type="radio" name="gender" value="male"\> Male\</label\>  
                            \<label\>\<input type="radio" name="gender" value="female"\> Female\</label\>  
                            \<label\>\<input type="radio" name="gender" value="na" checked\> Prefer not to say / Not applicable\</label\>  
                        \</div\>  
                    \</div\>  
                \</div\>  
                \<div class="buttons"\>  
                    \<button id="prevBtn" onclick="prevStep()"\>Previous\</button\>  
                    \<button id="nextBtn" onclick="nextStep()"\>Next\</button\>  
                \</div\>  
            \</div\>

            \<div id="step5" class="quiz-section"\>  
                \<h2\>Step 5: Lifestyle Factors\</h2\>  
                \<div class="question-group"\>  
                    \<div class="question"\>  
                        \<label for="sleepQuality"\>10. How would you rate your average nightly sleep quality?\</label\>  
                        \<select id="sleepQuality" name="sleepQuality"\>  
                            \<option value="good"\>Good\</option\>  
                            \<option value="fair"\>Fair\</option\>  
                            \<option value="poor"\>Poor\</option\>  
                        \</select\>  
                    \</div\>  
                    \<div class="question"\>  
                        \<label for="stressLevel"\>11. How would you rate your daily stress level?\</label\>  
                        \<select id="stressLevel" name="stressLevel"\>  
                            \<option value="low"\>Low\</option\>  
                            \<option value="moderate"\>Moderate\</option\>  
                            \<option value="high"\>High\</option\>  
                        \</select\>  
                    \</div\>  
                \</div\>  
                \<div class="buttons"\>  
                    \<button id="prevBtn" onclick="prevStep()"\>Previous\</button\>  
                    \<button id="submitBtn" onclick="calculateScore()"\>Get My Results\</button\>  
                \</div\>  
            \</div\>  
        \</div\>

        \<div id="results" class="results-section"\>  
            \<div class="disclaimer"\>  
                This tool is for educational purposes only and is not a medical diagnosis. Please consult with a qualified healthcare provider.  
            \</div\>  
            \<h2 id="resultsHeadline"\>\</h2\>  
            \<p id="resultsText"\>\</p\>  
            \<h3\>Next Steps:\</h3\>  
            \<ul id="nextStepsList"\>\</ul\>  
        \</div\>  
    \</div\>

    \<script\>  
        let currentStep \= 1;  
        const totalSteps \= 5;  
        const userSymptoms \= \[\]; // To store selected symptoms for dynamic insertion

        function showStep(step) {  
            document.querySelectorAll('.quiz-section').forEach(section \=\> {  
                section.classList.remove('active');  
            });  
            document.getElementById(\`step${step}\`).classList.add('active');

            document.getElementById('prevBtn').disabled \= (step \=== 1);  
            if (step \=== totalSteps) {  
                document.getElementById('nextBtn').style.display \= 'none';  
                document.getElementById('submitBtn').style.display \= 'inline-block';  
            } else {  
                document.getElementById('nextBtn').style.display \= 'inline-block';  
                document.getElementById('submitBtn').style.display \= 'none';  
            }  
        }

        function nextStep() {  
            if (currentStep \< totalSteps) {  
                currentStep++;  
                showStep(currentStep);  
            }  
        }

        function prevStep() {  
            if (currentStep \> 1\) {  
                currentStep--;  
                showStep(currentStep);  
            }  
        }

        function calculateScore() {  
            let riskScore \= 0;  
            userSymptoms.length \= 0; // Clear previous symptoms

            // Step 1: Energy & Cravings  
            if (document.querySelector('input\[name="q1"\]:checked').value \=== 'yes') {  
                riskScore \+= 10;  
                userSymptoms.push('feeling tired after meals');  
            }  
            if (document.querySelector('input\[name="q2"\]:checked').value \=== 'yes') {  
                riskScore \+= 10;  
                userSymptoms.push('frequent cravings for sugar');  
            }  
            if (document.querySelector('input\[name="q3"\]:checked').value \=== 'yes') {  
                riskScore \+= 10;  
                userSymptoms.push('"hangry" feelings');  
            }

            // Step 2: Physical Signs & Symptoms  
            if (document.querySelector('input\[name="q4"\]:checked').value \=== 'yes') {  
                riskScore \+= 15;  
                userSymptoms.push('difficulty losing belly fat');  
            }  
            if (document.querySelector('input\[name="q5"\]:checked').value \=== 'yes') {  
                riskScore \+= 15;  
                userSymptoms.push('new skin tags');  
            }  
            if (document.querySelector('input\[name="q6"\]:checked').value \=== '15') { // Typo in prompt, assumed this means yes  
                riskScore \+= 15;  
                userSymptoms.push('dark, velvety skin patches');  
            }

            // Step 3: Hormonal Health (For Female Users)  
            if (document.querySelector('input\[name="q7"\]:checked').value \=== 'yes') {  
                riskScore \+= 15;  
                userSymptoms.push('irregular menstrual cycles');  
            }  
            if (document.querySelector('input\[name="q8"\]:checked').value \=== 'yes') {  
                riskScore \+= 10;  
                userSymptoms.push('hormonal acne');  
            }  
            if (document.querySelector('input\[name="q9"\]:checked').value \=== 'yes') {  
                riskScore \+= 10;  
                userSymptoms.push('unwanted hair growth');  
            }

            // Step 4: Key Lab Values (Optional)  
            const fastingGlucose \= parseFloat(document.getElementById('fastingGlucose').value);  
            const triglycerides \= parseFloat(document.getElementById('triglycerides').value);  
            const hdlCholesterol \= parseFloat(document.getElementById('hdlCholesterol').value);  
            const gender \= document.querySelector('input\[name="gender"\]:checked').value;

            if (\!isNaN(fastingGlucose) && fastingGlucose \> 99\) {  
                riskScore \+= 15;  
            }  
            if (\!isNaN(triglycerides) && triglycerides \> 149\) {  
                riskScore \+= 10;  
            }  
            if (\!isNaN(hdlCholesterol)) {  
                if (gender \=== 'female' && hdlCholesterol \< 50\) {  
                    riskScore \+= 10;  
                } else if (gender \=== 'male' && hdlCholesterol \< 40\) {  
                    riskScore \+= 10;  
                }  
            }

            // Step 5: Lifestyle Factors  
            const sleepQuality \= document.getElementById('sleepQuality').value;  
            if (sleepQuality \=== 'poor') {  
                riskScore \+= 10;  
            } else if (sleepQuality \=== 'fair') {  
                riskScore \+= 5;  
            }

            const stressLevel \= document.getElementById('stressLevel').value;  
            if (stressLevel \=== 'high') {  
                riskScore \+= 10;  
            } else if (stressLevel \=== 'moderate') {  
                riskScore \+= 5;  
            }

            displayResults(riskScore);  
        }

        function displayResults(score) {  
            document.getElementById('quizForm').style.display \= 'none';  
            const resultsSection \= document.getElementById('results');  
            resultsSection.style.display \= 'block';

            const headline \= document.getElementById('resultsHeadline');  
            const resultsText \= document.getElementById('resultsText');  
            const nextStepsList \= document.getElementById('nextStepsList');  
            nextStepsList.innerHTML \= ''; // Clear previous steps  
            resultsSection.className \= 'results-section'; // Reset classes

            if (score \>= 0 && score \<= 30\) {  
                resultsSection.classList.add('low-risk');  
                headline.textContent \= '✅ Your Metabolic Health Appears to be on a Great Track\!';  
                resultsText.textContent \= "Your answers suggest a low current risk for significant insulin resistance. This is fantastic\! To continue optimizing your health and preventing future issues, focus on maintaining a whole-foods diet and a healthy lifestyle.";  
                addNextStep(nextStepsList, 'Explore my Metabolic Health Optimization program to take your wellness to the next level.', '\#'); // Placeholder link  
            } else if (score \>= 31 && score \<= 69\) {  
                resultsSection.classList.add('moderate-risk');  
                headline.textContent \= '💡 It Looks Like There Are Early Signs of Metabolic Imbalance.';  
                let symptomsText \= '';  
                if (userSymptoms.length \> 0\) {  
                    symptomsText \= userSymptoms.slice(0, 2).join(' and ');  
                }  
                resultsText.textContent \= \`Your results indicate a moderate risk for developing insulin resistance. You answered 'yes' to common early warning signs like ${symptomsText ? symptomsText \+ '.' : 'some common metabolic indicators.'} The good news is that at this stage, targeted lifestyle and nutrition changes can be incredibly effective at reversing these patterns.\`;  
                addNextStep(nextStepsList, 'Understand Your Food: Use my Glycemic Load Calculator to see how your current meals are impacting your blood sugar.', '\#'); // Placeholder link  
                addNextStep(nextStepsList, 'Get a Clear Plan: Download my free Anti-Inflammatory Guide to start making changes today.', '\#'); // Placeholder link  
                addNextStep(nextStepsList, 'Learn More: Read my guide on How to Reverse Insulin Resistance Naturally.', '\#'); // Placeholder link  
            } else { // Score 70+  
                resultsSection.classList.add('high-risk');  
                headline.textContent \= '⚠️ Your Body is Sending Clear Signals of Significant Insulin Resistance.';  
                let symptomsText \= '';  
                if (userSymptoms.length \> 0\) {  
                    symptomsText \= userSymptoms.slice(0, 2).join(' and ');  
                }  
                resultsText.textContent \= \`Thank you for taking this assessment. Your results show a high likelihood of insulin resistance, which may be the root cause behind the symptoms you're experiencing, such as ${symptomsText ? symptomsText \+ '.' : 'various metabolic indicators.'} While this can feel overwhelming, please know that you are in the right place, and this condition is highly responsive to the right interventions.\`;  
                addNextStep(nextStepsList, 'See the Full Picture: Your immediate next step is to understand this process fully. I highly recommend you explore my infographic: The Metabolic Reset Guide.', '\#'); // Placeholder link  
                addNextStep(nextStepsList, 'Talk to Your Doctor: Use my Doctor\\'s Visit Prep Tool to prepare for a productive conversation about getting your fasting insulin and HbA1c tested.', '\#'); // Placeholder link  
                addNextStep(nextStepsList, 'Take Action: When you\\'re ready to start a structured plan, my PCOS Hormonal Reset Program or Prediabetes Self-Care Program are designed to guide you every step of the way.', '\#'); // Placeholder link  
            }  
        }

        function addNextStep(ulElement, text, link) {  
            const li \= document.createElement('li');  
            const a \= document.createElement('a');  
            a.href \= link;  
            a.textContent \= text;  
            a.target \= "\_blank"; // Open in new tab  
            li.appendChild(a);  
            ulElement.appendChild(li);  
        }

        // Initialize the first step  
        document.addEventListener('DOMContentLoaded', () \=\> {  
            showStep(currentStep);  
        });  
    \</script\>  
\</body\>  
\</html\>  
\`\`\`

Fullscript discount

\<\!DOCTYPE html\>  
\<html lang="en"\>  
\<head\>  
    \<meta charset="UTF-8"\>  
    \<meta name="viewport" content="width=device-width, initial-scale=1.0"\>  
    \<title\>Lab Results Interpreter\</title\>  
    \<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700\&display=swap" rel="stylesheet"\>  
    \<style\>  
        :root {  
            \--color-optimal: \#d4edda; /\* Light Green \*/  
            \--color-borderline: \#fff3cd; /\* Light Yellow \*/  
            \--color-high-risk: \#f8d7da; /\* Light Red \*/  
            \--color-text-optimal: \#155724;  
            \--color-text-borderline: \#664d03;  
            \--color-text-high-risk: \#721c24;  
            \--color-primary: \#0056b3;  
            \--color-primary-dark: \#003d80;  
            \--color-border: \#ced4da;  
            \--color-shadow: rgba(0, 0, 0, 0.1);  
        }

        body {  
            font-family: 'Roboto', sans-serif;  
            line-height: 1.6;  
            color: \#333;  
            margin: 0;  
            padding: 20px;  
            background-color: \#f4f7f6;  
            display: flex;  
            justify-content: center;  
            align-items: flex-start;  
            min-height: 100vh;  
        }

        .container {  
            background: \#fff;  
            padding: 30px;  
            border-radius: 10px;  
            box-shadow: 0 5px 15px var(--color-shadow);  
            max-width: 900px;  
            width: 100%;  
        }

        h1, h2 {  
            text-align: center;  
            color: var(--color-primary);  
            margin-bottom: 25px;  
        }

        .input-section {  
            display: grid;  
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));  
            gap: 20px;  
            margin-bottom: 30px;  
        }

        .form-group {  
            margin-bottom: 15px;  
        }

        label {  
            display: block;  
            margin-bottom: 8px;  
            font-weight: 700;  
            color: \#555;  
        }

        input\[type="number"\] {  
            width: calc(100% \- 20px);  
            padding: 12px 10px;  
            border: 1px solid var(--color-border);  
            border-radius: 5px;  
            font-size: 1rem;  
            box-sizing: border-box;  
        }

        button {  
            display: block;  
            width: 100%;  
            padding: 15px;  
            background-color: var(--color-primary);  
            color: white;  
            border: none;  
            border-radius: 5px;  
            font-size: 1.1rem;  
            font-weight: 700;  
            cursor: pointer;  
            transition: background-color 0.3s ease;  
            margin-top: 20px;  
        }

        button:hover {  
            background-color: var(--color-primary-dark);  
        }

        .results-section {  
            margin-top: 40px;  
            border-top: 1px solid \#eee;  
            padding-top: 30px;  
        }

        .result-card {  
            padding: 15px;  
            border-radius: 8px;  
            margin-bottom: 15px;  
            display: flex;  
            flex-direction: column;  
            gap: 5px;  
            border: 1px solid transparent; /\* For borders that match background \*/  
        }

        .result-card.optimal {  
            background-color: var(--color-optimal);  
            color: var(--color-text-optimal);  
            border-color: darken(var(--color-optimal), 10%);  
        }

        .result-card.borderline {  
            background-color: var(--color-borderline);  
            color: var(--color-text-borderline);  
            border-color: darken(var(--color-borderline), 10%);  
        }

        .result-card.high-risk {  
            background-color: var(--color-high-risk);  
            color: var(--color-text-high-risk);  
            border-color: darken(var(--color-high-risk), 10%);  
        }

        .marker-title {  
            font-weight: 700;  
            font-size: 1.1em;  
            margin-bottom: 5px;  
        }

        .practitioner-note {  
            font-size: 0.95em;  
            line-height: 1.5;  
            margin-top: 5px;  
        }

        .value-display {  
            font-size: 1em;  
            font-weight: bold;  
        }

        .lead-capture-section {  
            margin-top: 40px;  
            padding: 30px;  
            background-color: \#e9f5ff;  
            border-radius: 10px;  
            text-align: center;  
            border: 1px solid var(--color-primary);  
        }

        .lead-capture-section h2 {  
            color: var(--color-primary);  
            margin-bottom: 15px;  
        }

        .lead-capture-section p {  
            font-size: 1.1em;  
            margin-bottom: 25px;  
            color: \#444;  
        }

        .lead-capture-section button {  
            background-color: \#28a745; /\* Green for CTA \*/  
            width: auto;  
            padding: 15px 30px;  
            font-size: 1.15rem;  
            margin: 0 auto;  
        }

        .lead-capture-section button:hover {  
            background-color: \#218838;  
        }

        \#error-message {  
            color: var(--color-text-high-risk);  
            text-align: center;  
            margin-bottom: 20px;  
            font-weight: bold;  
        }  
    \</style\>  
\</head\>  
\<body\>  
    \<div class="container"\>  
        \<h1\>Lab Results Interpreter\</h1\>  
        \<p style="text-align: center; margin-bottom: 30px; color: \#666;"\>Unlock insights into your metabolic health by entering your recent lab values below.\</p\>

        \<div id="error-message" style="display: none;"\>\</div\>

        \<div class="input-section"\>  
            \<div class="form-group"\>  
                \<label for="fastingGlucose"\>Fasting Glucose (mg/dL)\</label\>  
                \<input type="number" id="fastingGlucose" placeholder="e.g., 90"\>  
            \</div\>  
            \<div class="form-group"\>  
                \<label for="hba1c"\>HbA1c (%)\</label\>  
                \<input type="number" step="0.1" id="hba1c" placeholder="e.g., 5.4"\>  
            \</div\>  
            \<div class="form-group"\>  
                \<label for="triglycerides"\>Triglycerides (mg/dL)\</label\>  
                \<input type="number" id="triglycerides" placeholder="e.g., 100"\>  
            \</div\>  
            \<div class="form-group"\>  
                \<label for="hdlCholesterol"\>HDL Cholesterol (mg/dL)\</label\>  
                \<input type="number" id="hdlCholesterol" placeholder="e.g., 55"\>  
            \</div\>  
            \<div class="form-group"\>  
                \<label for="fastingInsulin"\>Fasting Insulin (µIU/mL) (Optional)\</label\>  
                \<input type="number" step="0.1" id="fastingInsulin" placeholder="e.g., 7.5"\>  
            \</div\>  
        \</div\>

        \<button id="interpretLabs"\>Interpret My Labs\</button\>

        \<div id="resultsDisplay" class="results-section" style="display: none;"\>  
            \<h2\>Your Metabolic Health Snapshot\</h2\>  
            \<div id="labResultCards"\>  
                \</div\>  
            \<div class="lead-capture-section"\>  
                \<h2\>Your Labs Tell a Story. Let's Write the Next Chapter.\</h2\>  
                \<p\>Understanding your numbers is the first step. The next is having a clear action plan. I specialize in creating personalized nutrition and lifestyle protocols to improve these exact markers.\</p\>  
                \<button onclick="window.open('https://huntersholistichealth.com/contact', '\_blank');"\>Schedule a FREE 15-Minute Consultation to Discuss Your Results\</button\>  
            \</div\>  
        \</div\>  
    \</div\>

    \<script\>  
        document.getElementById('interpretLabs').addEventListener('click', interpretLabs);

        function interpretLabs() {  
            const fastingGlucose \= parseFloat(document.getElementById('fastingGlucose').value);  
            const hba1c \= parseFloat(document.getElementById('hba1c').value);  
            const triglycerides \= parseFloat(document.getElementById('triglycerides').value);  
            const hdlCholesterol \= parseFloat(document.getElementById('hdlCholesterol').value);  
            const fastingInsulin \= parseFloat(document.getElementById('fastingInsulin').value);

            const errorMessageDiv \= document.getElementById('error-message');  
            errorMessageDiv.style.display \= 'none';  
            errorMessageDiv.textContent \= '';

            const requiredFields \= \[  
                { value: fastingGlucose, name: 'Fasting Glucose' },  
                { value: hba1c, name: 'HbA1c' },  
                { value: triglycerides, name: 'Triglycerides' },  
                { value: hdlCholesterol, name: 'HDL Cholesterol' }  
            \];

            const missingFields \= requiredFields.filter(field \=\> isNaN(field.value));

            if (missingFields.length \> 0\) {  
                errorMessageDiv.textContent \= \`Please enter values for: ${missingFields.map(f \=\> f.name).join(', ')}.\`;  
                errorMessageDiv.style.display \= 'block';  
                document.getElementById('resultsDisplay').style.display \= 'none';  
                return;  
            }

            const results \= \[\];

            // Fasting Glucose  
            let glucoseStatus, glucoseNote;  
            if (fastingGlucose \< 86\) {  
                glucoseStatus \= 'optimal';  
                glucoseNote \= "Optimal fasting glucose indicates good blood sugar control. Keep up the great work\!";  
            } else if (fastingGlucose \>= 86 && fastingGlucose \<= 99\) {  
                glucoseStatus \= 'borderline';  
                glucoseNote \= "Your fasting glucose is in a borderline range, suggesting a need to monitor your diet and lifestyle to prevent progression towards pre-diabetes.";  
            } else {  
                glucoseStatus \= 'high-risk';  
                glucoseNote \= "Elevated fasting glucose is a strong indicator of insulin resistance or pre-diabetes. It's crucial to address this to prevent further metabolic dysfunction.";  
            }  
            results.push({  
                marker: 'Fasting Glucose',  
                value: \`${fastingGlucose} mg/dL\`,  
                status: glucoseStatus,  
                note: glucoseNote  
            });

            // HbA1c  
            let hba1cStatus, hba1cNote;  
            if (hba1c \< 5.3) {  
                hba1cStatus \= 'optimal';  
                hba1cNote \= "Your HbA1c is optimal, reflecting excellent long-term blood sugar control. This is a key marker for metabolic health.";  
            } else if (hba1c \>= 5.3 && hba1c \<= 5.6) {  
                hba1cStatus \= 'borderline';  
                hba1cNote \= "Your HbA1c is in a borderline range, indicating that your average blood sugar over the past 2-3 months is higher than ideal. This suggests early signs of insulin dysregulation.";  
            } else {  
                hba1cStatus \= 'high-risk';  
                hba1cNote \= "A high HbA1c signifies elevated average blood sugar levels, indicating pre-diabetes or diabetes. This requires immediate attention to prevent chronic health issues.";  
            }  
            results.push({  
                marker: 'HbA1c',  
                value: \`${hba1c}%\`,  
                status: hba1cStatus,  
                note: hba1cNote  
            });

            // Triglycerides  
            let triglyceridesStatus, triglyceridesNote;  
            if (triglycerides \< 100\) {  
                triglyceridesStatus \= 'optimal';  
                triglyceridesNote \= "Optimal triglyceride levels are a good sign of healthy fat metabolism and lower cardiovascular risk.";  
            } else if (triglycerides \>= 100 && triglycerides \<= 150\) {  
                triglyceridesStatus \= 'borderline';  
                triglyceridesNote \= "Your triglycerides are borderline. While not critically high, this indicates that dietary changes and lifestyle adjustments could significantly improve your metabolic profile.";  
            } else {  
                triglyceridesStatus \= 'high-risk';  
                triglyceridesNote \= "Elevated triglycerides are often linked to insulin resistance, increased risk of heart disease, and fatty liver. Dietary changes are essential.";  
            }  
            results.push({  
                marker: 'Triglycerides',  
                value: \`${triglycerides} mg/dL\`,  
                status: triglyceridesStatus,  
                note: triglyceridesNote  
            });

            // HDL Cholesterol  
            let hdlStatus, hdlNote;  
            if (hdlCholesterol \> 60\) {  
                hdlStatus \= 'optimal';  
                hdlNote \= "Excellent HDL levels\! Often called 'good' cholesterol, high HDL helps remove excess cholesterol from your arteries, protecting your heart.";  
            } else if (hdlCholesterol \>= 40 && hdlCholesterol \<= 60\) {  
                hdlStatus \= 'borderline';  
                hdlNote \= "Your HDL cholesterol is in a healthy range, but there's room for improvement. Increasing your intake of healthy fats and regular exercise can boost this protective marker.";  
            } else {  
                hdlStatus \= 'high-risk';  
                hdlNote \= "Low HDL cholesterol is a risk factor for heart disease. It suggests your body might not be efficiently clearing cholesterol, highlighting a need for lifestyle interventions.";  
            }  
            results.push({  
                marker: 'HDL Cholesterol',  
                value: \`${hdlCholesterol} mg/dL\`,  
                status: hdlStatus,  
                note: hdlNote  
            });

            // Triglyceride/HDL Ratio  
            let trighdlRatio \= triglycerides / hdlCholesterol;  
            let trighdlStatus, trighdlNote;  
            if (trighdlRatio \< 1.5) {  
                trighdlStatus \= 'optimal';  
                trighdlNote \= "Your Triglyceride/HDL Ratio is optimal, indicating very good insulin sensitivity and a lower risk of metabolic issues.";  
            } else if (trighdlRatio \>= 1.5 && trighdlRatio \<= 2.5) {  
                trighdlStatus \= 'borderline';  
                trighdlNote \= "Your Triglyceride/HDL Ratio is in a borderline range. This ratio is a powerful predictor of insulin resistance. A ratio above 1.5 suggests some degree of metabolic dysfunction, even if other markers look okay.";  
            } else {  
                trighdlStatus \= 'high-risk';  
                trighdlNote \= "Your Triglyceride/HDL Ratio is high. This ratio is one of the most powerful predictors of insulin resistance. A ratio above 2.5 suggests significant metabolic dysfunction, even if your LDL cholesterol looks normal.";  
            }  
            results.push({  
                marker: 'Triglyceride/HDL Ratio',  
                value: trighdlRatio.toFixed(1),  
                status: trighdlStatus,  
                note: trighdlNote  
            });

            // Fasting Insulin (optional)  
            if (\!isNaN(fastingInsulin)) {  
                let insulinStatus, insulinNote;  
                if (fastingInsulin \< 5\) {  
                    insulinStatus \= 'optimal';  
                    insulinNote \= "Your fasting insulin is optimal, indicating your body is efficiently managing blood sugar without overproducing insulin. This is a sign of excellent insulin sensitivity.";  
                } else if (fastingInsulin \>= 5 && fastingInsulin \< 7\) {  
                    insulinStatus \= 'borderline';  
                    insulinNote \= "Your fasting insulin is borderline. While technically 'in range' on some lab reports, a fasting insulin above 5 suggests your body might be starting to work harder to maintain blood sugar levels. This is an early warning sign for insulin resistance.";  
                } else {  
                    insulinStatus \= 'high-risk';  
                    insulinNote \= "Your Fasting Insulin is high. While technically 'in range' on some lab reports, a fasting insulin above 7 indicates that your body is working too hard to manage your blood sugar, a key sign of early insulin resistance. This often precedes elevated blood glucose.";  
                }  
                results.push({  
                    marker: 'Fasting Insulin',  
                    value: \`${fastingInsulin} µIU/mL\`,  
                    status: insulinStatus,  
                    note: insulinNote  
                });  
            }

            displayResults(results);  
        }

        function displayResults(results) {  
            const labResultCards \= document.getElementById('labResultCards');  
            labResultCards.innerHTML \= ''; // Clear previous results

            results.forEach(result \=\> {  
                const card \= document.createElement('div');  
                card.className \= \`result-card ${result.status}\`;  
                card.innerHTML \= \`  
                    \<div class="marker-title"\>${result.marker}\</div\>  
                    \<div class="value-display"\>Your ${result.marker} is \<strong\>${result.value}\</strong\>.\</div\>  
                    \<div class="practitioner-note"\>\<strong\>Practitioner's Note:\</strong\> ${result.note}\</div\>  
                \`;  
                labResultCards.appendChild(card);  
            });

            document.getElementById('resultsDisplay').style.display \= 'block';  
            window.scrollTo({  
                top: document.getElementById('resultsDisplay').offsetTop \- 20,  
                behavior: 'smooth'  
            });  
        }  
    \</script\>  
\</body\>  
\</html\>

Metabolic health and symptoms analyzer

\<\!DOCTYPE html\>  
\<html lang="en"\>  
\<head\>  
    \<meta charset="UTF-8"\>  
    \<meta name="viewport" content="width=device-width, initial-scale=1.0"\>  
    \<title\>Metabolic Health & Symptom Analyzer\</title\>  
    \<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700\&display=swap" rel="stylesheet"\>  
    \<style\>  
        :root {  
            \--primary-color: \#3f6e8c; /\* A calming blue \*/  
            \--primary-dark: \#2d5069;  
            \--accent-color: \#e67e22; /\* Orange for emphasis \*/  
            \--background-color: \#f4f7f6;  
            \--card-background: \#ffffff;  
            \--border-color: \#ced4da;  
            \--shadow: rgba(0, 0, 0, 0.1);  
            \--grade-a: \#28a745; /\* Green \*/  
            \--grade-b: \#66bb6a; /\* Lighter Green \*/  
            \--grade-c: \#ffc107; /\* Yellow \*/  
            \--grade-d: \#fd7e14; /\* Orange \*/  
            \--grade-f: \#dc3545; /\* Red \*/  
        }

        body {  
            font-family: 'Roboto', sans-serif;  
            line-height: 1.6;  
            color: \#333;  
            margin: 0;  
            padding: 20px;  
            background-color: var(--background-color);  
            display: flex;  
            justify-content: center;  
            align-items: flex-start;  
            min-height: 100vh;  
        }

        .container {  
            background: var(--card-background);  
            padding: 30px;  
            border-radius: 10px;  
            box-shadow: 0 5px 15px var(--shadow);  
            max-width: 850px;  
            width: 100%;  
            box-sizing: border-box;  
        }

        h1, h2 {  
            text-align: center;  
            color: var(--primary-color);  
            margin-bottom: 25px;  
        }

        p {  
            text-align: center;  
            margin-bottom: 20px;  
            color: \#555;  
        }

        .symptom-section {  
            margin-bottom: 30px;  
            border: 1px solid var(--border-color);  
            border-radius: 8px;  
            padding: 20px;  
            background-color: \#fdfdfd;  
        }

        .symptom-group {  
            margin-bottom: 20px;  
        }

        .symptom-group label {  
            display: block;  
            margin-bottom: 10px;  
            font-weight: 700;  
            color: var(--primary-color);  
            font-size: 1.1em;  
        }

        .checkbox-group {  
            display: grid;  
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));  
            gap: 10px;  
        }

        .checkbox-item {  
            display: flex;  
            align-items: center;  
            padding: 8px 0;  
        }

        .checkbox-item input\[type="checkbox"\] {  
            margin-right: 10px;  
            transform: scale(1.2);  
        }

        button {  
            display: block;  
            width: 100%;  
            padding: 15px;  
            background-color: var(--accent-color);  
            color: white;  
            border: none;  
            border-radius: 5px;  
            font-size: 1.1rem;  
            font-weight: 700;  
            cursor: pointer;  
            transition: background-color 0.3s ease;  
            margin-top: 20px;  
        }

        button:hover {  
            background-color: \#d86910;  
        }

        .results-section {  
            margin-top: 40px;  
            border-top: 1px solid var(--border-color);  
            padding-top: 30px;  
            display: none; /\* Hidden by default \*/  
        }

        .grade-display {  
            text-align: center;  
            margin-bottom: 30px;  
        }

        .grade {  
            font-size: 2.8em;  
            font-weight: 700;  
            padding: 15px 25px;  
            border-radius: 10px;  
            display: inline-block;  
            color: white;  
            box-shadow: 0 2px 5px var(--shadow);  
            margin-bottom: 15px;  
        }

        .grade.grade-A { background-color: var(--grade-a); }  
        .grade.grade-B { background-color: var(--grade-b); }  
        .grade.grade-C { background-color: var(--grade-c); }  
        .grade.grade-D { background-color: var(--grade-d); }  
        .grade.grade-F { background-color: var(--grade-f); }

        .analysis-text {  
            font-size: 1.1em;  
            line-height: 1.7;  
            text-align: left;  
            background-color: \#f0f8ff;  
            border: 1px solid \#cceeff;  
            border-radius: 8px;  
            padding: 20px;  
            margin-bottom: 30px;  
            color: \#333;  
        }

        .next-steps-list {  
            list-style: none;  
            padding: 0;  
            margin-bottom: 30px;  
        }

        .next-steps-list li {  
            background-color: \#e9f5ff;  
            border-left: 5px solid var(--primary-color);  
            padding: 15px;  
            margin-bottom: 10px;  
            border-radius: 5px;  
            font-size: 1em;  
            color: \#333;  
            display: flex;  
            align-items: center;  
            gap: 10px;  
        }

        .next-steps-list li strong {  
            color: var(--primary-color);  
        }

        .next-steps-list li a {  
            color: var(--accent-color);  
            text-decoration: none;  
            font-weight: 700;  
        }

        .next-steps-list li a:hover {  
            text-decoration: underline;  
        }

        .lead-capture-section {  
            margin-top: 40px;  
            padding: 30px;  
            background-color: \#e9f5ff;  
            border-radius: 10px;  
            text-align: center;  
            border: 1px solid var(--primary-color);  
        }

        .lead-capture-section h2 {  
            color: var(--primary-color);  
            margin-bottom: 15px;  
        }

        .lead-capture-section p {  
            font-size: 1.1em;  
            margin-bottom: 25px;  
            color: \#444;  
        }

        .lead-capture-form .form-group {  
            max-width: 400px;  
            margin: 0 auto 20px auto;  
        }

        .lead-capture-form label {  
            display: block;  
            margin-bottom: 8px;  
            font-weight: 700;  
            color: \#555;  
            text-align: left;  
        }

        .lead-capture-form input\[type="text"\],  
        .lead-capture-form input\[type="email"\] {  
            width: calc(100% \- 22px);  
            padding: 12px 10px;  
            border: 1px solid var(--border-color);  
            border-radius: 5px;  
            font-size: 1rem;  
            box-sizing: border-box;  
        }

        .lead-capture-form button {  
            background-color: var(--grade-a); /\* Green for CTA \*/  
            width: auto;  
            padding: 15px 30px;  
            font-size: 1.15rem;  
            margin: 20px auto 0 auto;  
        }

        .lead-capture-form button:hover {  
            background-color: \#218838;  
        }  
        \#error-message {  
            color: var(--grade-f);  
            text-align: center;  
            margin-bottom: 20px;  
            font-weight: bold;  
            display: none;  
        }  
    \</style\>  
\</head\>  
\<body\>  
    \<div class="container"\>  
        \<div id="quizSection"\>  
            \<h1\>Metabolic Health & Symptom Analyzer\</h1\>  
            \<p\>Answer a few questions about your daily experience to get a personalized metabolic health grade and insights.\</p\>

            \<div id="error-message"\>\</div\>

            \<div class="symptom-section"\>  
                \<div class="symptom-group"\>  
                    \<label\>Energy & Fatigue:\</label\>  
                    \<div class="checkbox-group"\>  
                        \<div class="checkbox-item"\>\<input type="checkbox" id="tiredAfterMeals" data-score="5"\> \<label for="tiredAfterMeals"\>Feeling tired or sleepy after meals\</label\>\</div\>  
                        \<div class="checkbox-item"\>\<input type="checkbox" id="midAfternoonSlump" data-score="4"\> \<label for="midAfternoonSlump"\>Mid-afternoon energy slump\</label\>\</div\>  
                        \<div class="checkbox-item"\>\<input type="checkbox" id="wakingFatigued" data-score="3"\> \<label for="wakingFatigued"\>Waking up feeling fatigued, even after enough sleep\</label\>\</div\>  
                        \<div class="checkbox-item"\>\<input type="checkbox" id="chronicFatigue" data-score="6"\> \<label for="chronicFatigue"\>Persistent fatigue throughout the day\</label\>\</div\>  
                    \</div\>  
                \</div\>

                \<div class="symptom-group"\>  
                    \<label\>Cravings & Appetite:\</label\>  
                    \<div class="checkbox-group"\>  
                        \<div class="checkbox-item"\>\<input type="checkbox" id="sugarCravings" data-score="5"\> \<label for="sugarCravings"\>Strong cravings for sugar or refined carbs\</label\>\</div\>  
                        \<div class="checkbox-item"\>\<input type="checkbox" id="hungrySoonAfterMeals" data-score="4"\> \<label for="hungrySoonAfterMeals"\>Feeling hungry soon after eating\</label\>\</div\>  
                        \<div class="checkbox-item"\>\<input type="checkbox" id="difficultySkippingMeals" data-score="3"\> \<label for="difficultySkippingMeals"\>Difficulty skipping meals without feeling shaky/irritable\</label\>\</div\>  
                    \</div\>  
                \</div\>

                \<div class="symptom-group"\>  
                    \<label\>Weight & Body Composition:\</label\>  
                    \<div class="checkbox-group"\>  
                        \<div class="checkbox-item"\>\<input type="checkbox" id="bellyFat" data-score="6"\> \<label for="bellyFat"\>Difficulty losing weight, especially around the belly\</label\>\</div\>  
                        \<div class="checkbox-item"\>\<input type="checkbox" id="weightGainEasily" data-score="5"\> \<label for="weightGainEasily"\>Gaining weight easily, even with moderate eating\</label\>\</div\>  
                    \</div\>  
                \</div\>

                \<div class="symptom-group"\>  
                    \<label\>Hormonal & Other Symptoms (if applicable):\</label\>  
                    \<div class="checkbox-group"\>  
                        \<div class="checkbox-item"\>\<input type="checkbox" id="irregularCycles" data-score="5"\> \<label for="irregularCycles"\>Irregular menstrual cycles\</label\>\</div\>  
                        \<div class="checkbox-item"\>\<input type="checkbox" id="hairLossThinning" data-score="4"\> \<label for="hairLossThinning"\>Hair loss or thinning (scalp)\</label\>\</div\>  
                        \<div class="checkbox-item"\>\<input type="checkbox" id="excessHair" data-score="4"\> \<label for="excessHair"\>Excess facial or body hair (hirsutism)\</label\>\</div\>  
                        \<div class="checkbox-item"\>\<input type="checkbox" id="acne" data-score="3"\> \<label for="acne"\>Adult acne (especially cystic)\</label\>\</div\>  
                        \<div class="checkbox-item"\>\<input type="checkbox" id="brainFog" data-score="3"\> \<label for="brainFog"\>Brain fog or difficulty concentrating\</label\>\</div\>  
                        \<div class="checkbox-item"\>\<input type="checkbox" id="skinTags" data-score="4"\> \<label for="skinTags"\>Skin tags or dark patches of skin (acanthosis nigricans)\</label\>\</div\>  
                    \</div\>  
                \</div\>  
            \</div\>

            \<button id="analyzeSymptomsBtn"\>Analyze My Symptoms\</button\>  
        \</div\>

        \<div id="resultsSection" class="results-section"\>  
            \<h2\>Your Metabolic Health Report\</h2\>  
            \<div class="grade-display"\>  
                \<div id="metabolicGrade" class="grade"\>\</div\>  
                \<p id="gradeDescription" style="font-size: 1.2em; font-weight: bold;"\>\</p\>  
            \</div\>

            \<div class="analysis-text" id="analysisText"\>  
                \</div\>

            \<h3 style="text-align: center; color: var(--primary-color); margin-bottom: 20px;"\>Your Personalized Next Steps:\</h3\>  
            \<ul class="next-steps-list" id="nextStepsList"\>  
                \</ul\>

            \<div class="lead-capture-section"\>  
                \<h2\>Want a professional to review your results and create a custom plan?\</h2\>  
                \<p\>Enter your name and email below to schedule your FREE 15-minute consultation. We'll discuss your specific symptoms and how to achieve your health goals.\</p\>  
                \<div class="lead-capture-form"\>  
                    \<div class="form-group"\>  
                        \<label for="leadFirstName"\>First Name\</label\>  
                        \<input type="text" id="leadFirstName" placeholder="Your First Name"\>  
                    \</div\>  
                    \<div class="form-group"\>  
                        \<label for="leadEmail"\>Email\</label\>  
                        \<input type="email" id="leadEmail" placeholder="Your Email Address"\>  
                    \</div\>  
                    \<button id="scheduleConsultBtn"\>Schedule Your FREE Consultation\</button\>  
                \</div\>  
            \</div\>  
        \</div\>  
    \</div\>

    \<script\>  
        document.getElementById('analyzeSymptomsBtn').addEventListener('click', analyzeSymptoms);  
        document.getElementById('scheduleConsultBtn').addEventListener('click', scheduleConsultation);

        const symptomMap \= {  
            tiredAfterMeals: { text: "feeling tired or sleepy after meals", weight: 5, category: "insulin resistance" },  
            midAfternoonSlump: { text: "mid-afternoon energy slump", weight: 4, category: "blood sugar dysregulation" },  
            wakingFatigued: { text: "waking up feeling fatigued, even after enough sleep", weight: 3, category: "general fatigue" },  
            chronicFatigue: { text: "persistent fatigue throughout the day", weight: 6, category: "general fatigue" },  
            sugarCravings: { text: "strong cravings for sugar or refined carbs", weight: 5, category: "insulin resistance" },  
            hungrySoonAfterMeals: { text: "feeling hungry soon after eating", weight: 4, category: "insulin resistance" },  
            difficultySkippingMeals: { text: "difficulty skipping meals without feeling shaky/irritable", weight: 3, category: "blood sugar dysregulation" },  
            bellyFat: { text: "difficulty losing weight, especially around the belly", weight: 6, category: "insulin resistance" },  
            weightGainEasily: { text: "gaining weight easily, even with moderate eating", weight: 5, category: "metabolic slowdown" },  
            irregularCycles: { text: "irregular menstrual cycles", weight: 5, category: "hormonal imbalance" },  
            hairLossThinning: { text: "hair loss or thinning (scalp)", weight: 4, category: "hormonal imbalance" },  
            excessHair: { text: "excess facial or body hair (hirsutism)", weight: 4, category: "hormonal imbalance" },  
            acne: { text: "adult acne (especially cystic)", weight: 3, category: "hormonal imbalance" },  
            brainFog: { text: "brain fog or difficulty concentrating", weight: 3, category: "inflammation" },  
            skinTags: { text: "skin tags or dark patches of skin", weight: 4, category: "insulin resistance" }  
        };

        function analyzeSymptoms() {  
            let totalScore \= 0;  
            const selectedSymptoms \= \[\];  
            const symptomCategories \= {  
                "insulin resistance": 0,  
                "blood sugar dysregulation": 0,  
                "hormonal imbalance": 0,  
                "inflammation": 0,  
                "general fatigue": 0,  
                "metabolic slowdown": 0  
            };

            const checkboxes \= document.querySelectorAll('\#quizSection input\[type="checkbox"\]');  
            let anySymptomSelected \= false;  
            checkboxes.forEach(checkbox \=\> {  
                if (checkbox.checked) {  
                    anySymptomSelected \= true;  
                    const symptomId \= checkbox.id;  
                    const symptomData \= symptomMap\[symptomId\];  
                    if (symptomData) {  
                        totalScore \+= symptomData.weight;  
                        selectedSymptoms.push(symptomData.text);  
                        symptomCategories\[symptomData.category\] \+= symptomData.weight;  
                    }  
                }  
            });

            const errorMessageDiv \= document.getElementById('error-message');  
            if (\!anySymptomSelected) {  
                errorMessageDiv.textContent \= "Please select at least one symptom to get your analysis.";  
                errorMessageDiv.style.display \= 'block';  
                document.getElementById('resultsSection').style.display \= 'none';  
                return;  
            } else {  
                errorMessageDiv.style.display \= 'none';  
            }

            displayResults(totalScore, selectedSymptoms, symptomCategories);  
        }

        function displayResults(score, selectedSymptoms, symptomCategories) {  
            document.getElementById('quizSection').style.display \= 'none';  
            document.getElementById('resultsSection').style.display \= 'block';

            const metabolicGradeElement \= document.getElementById('metabolicGrade');  
            const gradeDescriptionElement \= document.getElementById('gradeDescription');  
            const analysisTextElement \= document.getElementById('analysisText');  
            const nextStepsList \= document.getElementById('nextStepsList');  
            nextStepsList.innerHTML \= ''; // Clear previous steps

            let grade \= 'F';  
            let gradeText \= 'Significant Concerns';  
            let analysisParagraph \= '';  
            let primaryIssue \= '';

            // Determine primary issue based on highest category score  
            let maxCategoryScore \= \-1; // Initialize with \-1 to handle cases where all are 0  
            for (const category in symptomCategories) {  
                if (symptomCategories\[category\] \> maxCategoryScore) {  
                    maxCategoryScore \= symptomCategories\[category\];  
                    primaryIssue \= category;  
                }  
            }

            // Fallback for cases with very few selected symptoms or low scores  
            if (primaryIssue \=== "" || maxCategoryScore \=== 0\) {  
                 primaryIssue \= "metabolic imbalance"; // Generic fallback  
            }

            // Custom analysis based on primary issue and score thresholds  
            const symptomPreview \= selectedSymptoms.length \> 0 ? selectedSymptoms.slice(0, 3).join(', ') \+ (selectedSymptoms.length \> 3 ? ', and more' : '') : '';

            if (score \<= 8\) { // Score adjusted for better grading  
                grade \= 'A';  
                gradeText \= 'Excellent Metabolic Health\!';  
                analysisParagraph \= \`Based on your answers, your symptoms indicate that your metabolic health is in \*\*excellent shape\*\*. You're likely experiencing minimal to no signs of metabolic imbalance. Keep up the great work\!\`;  
            } else if (score \<= 18\) {  
                grade \= 'B';  
                gradeText \= 'Good Metabolic Health\!';  
                analysisParagraph \= \`Your symptoms, such as ${symptomPreview}, suggest \*\*good metabolic health\*\* with minor areas for attention. Staying proactive with lifestyle choices will help you maintain optimal balance.\`;  
            } else if (score \<= 28\) {  
                grade \= 'C';  
                gradeText \= 'Moderate Metabolic Health \- Opportunities for Improvement';  
                analysisParagraph \= \`Based on your answers, your symptoms like ${symptomPreview} strongly point towards underlying \*\*${primaryIssue.replace("general fatigue", "metabolic stress")}\*\*. This is a common root cause for what you're experiencing. Addressing this area can significantly improve your well-being.\`;  
            } else if (score \<= 38\) {  
                grade \= 'D';  
                gradeText \= 'Metabolic Health Concerns \- Needs Attention';  
                analysisParagraph \= \`Your symptoms, including ${symptomPreview}, indicate \*\*significant metabolic health concerns\*\*, particularly pointing towards \*\*${primaryIssue}\*\*. This suggests your body is working hard to maintain balance. Focusing on root causes is crucial.\`;  
            } else {  
                grade \= 'F';  
                gradeText \= 'Significant Metabolic Dysfunction \- Immediate Attention Advised';  
                analysisParagraph \= \`Based on your answers, your symptoms like ${symptomPreview} suggest \*\*significant metabolic dysfunction\*\* and likely indicate underlying \*\*${primaryIssue}\*\*. This level of symptoms requires immediate attention to prevent further health complications.\`;  
            }

            metabolicGradeElement.textContent \= \`Your Metabolic Grade: ${grade}\`;  
            metabolicGradeElement.className \= \`grade grade-${grade}\`; // Apply color class  
            gradeDescriptionElement.textContent \= gradeText;  
            analysisTextElement.innerHTML \= \`\<strong\>Analysis:\</strong\> ${analysisParagraph}\`;

            // Personalized Next Steps  
            if (grade \=== 'A' || grade \=== 'B') {  
                const li \= document.createElement('li');  
                li.innerHTML \= \`Continue focusing on a balanced diet, regular exercise, and stress management to maintain your excellent metabolic health.\`;  
                nextStepsList.appendChild(li);  
            } else {  
                // Default steps for C, D, F grades, tailored by primary issue  
                if (primaryIssue.includes("insulin resistance") || primaryIssue.includes("blood sugar dysregulation")) {  
                    const li1 \= document.createElement('li');  
                    li1.innerHTML \= \`Understand \<strong\>Insulin Resistance\</strong\>: Learn more about its impact on your health. \<a href="YOUR\_RUSTED\_LOCK\_INFOGRAPHIC\_LINK" target="\_blank"\>View Infographic\</a\>\`;  
                    nextStepsList.appendChild(li1);  
                    const li2 \= document.createElement('li');  
                    li2.innerHTML \= \`See how food impacts you: Explore how different foods affect blood sugar with our \<a href="YOUR\_GLYCEMIC\_LOAD\_CALCULATOR\_LINK" target="\_blank"\>Glycemic Load Calculator\</a\>.\`;  
                    nextStepsList.appendChild(li2);  
                    const li3 \= document.createElement('li');  
                    li3.innerHTML \= \`Learn which foods to start with: Use our \<a href="YOUR\_GROCERY\_LIST\_BUILDER\_LINK" target="\_blank"\>PCOS-Friendly Grocery List Builder\</a\> for healthier choices.\`;  
                    nextStepsList.appendChild(li3);  
                }  
                  
                if (primaryIssue.includes("hormonal imbalance")) {  
                     const li1 \= document.createElement('li');  
                    li1.innerHTML \= \`Explore how nutrition impacts hormones: Focus on nutrient-dense foods that support hormonal balance.\`;  
                    nextStepsList.appendChild(li1);  
                    const li2 \= document.createElement('li');  
                    li2.innerHTML \= \`Learn about balancing blood sugar, which is crucial for hormone health: Use our \<a href="YOUR\_GLYCEMIC\_LOAD\_CALCULATOR\_LINK" target="\_blank"\>Glycemic Load Calculator\</a\>.\`;  
                    nextStepsList.appendChild(li2);  
                    const li3 \= document.createElement('li');  
                    li3.innerHTML \= \`Discover foods that support hormonal health with our \<a href="YOUR\_GROCERY\_LIST\_BUILDER\_LINK" target="\_blank"\>PCOS-Friendly Grocery List Builder\</a\>.\`;  
                    nextStepsList.appendChild(li3);  
                }   
                  
                if (primaryIssue.includes("inflammation")) {  
                    const li1 \= document.createElement('li');  
                    li1.innerHTML \= \`Understand inflammatory foods: Identify common triggers that might be contributing to your symptoms.\`;  
                    nextStepsList.appendChild(li1);  
                    const li2 \= document.createElement('li');  
                    li2.innerHTML \= \`Discover anti-inflammatory foods: Focus on incorporating more whole, unprocessed foods like berries, leafy greens, and healthy fats.\`;  
                    nextStepsList.appendChild(li2);  
                    const li3 \= document.createElement('li');  
                    li3.innerHTML \= \`Learn how blood sugar spikes can fuel inflammation using our \<a href="YOUR\_GLYCEMIC\_LOAD\_CALCULATOR\_LINK" target="\_blank"\>Glycemic Load Calculator\</a\>.\`;  
                    nextStepsList.appendChild(li3);  
                }   
                  
                if (primaryIssue.includes("general fatigue") || primaryIssue.includes("metabolic slowdown")) {  
                    const li1 \= document.createElement('li');  
                    li1.innerHTML \= \`Prioritize balanced meals with protein, healthy fats, and fiber to stabilize energy.\`;  
                    nextStepsList.appendChild(li1);  
                    const li2 \= document.createElement('li');  
                    li2.innerHTML \= \`Consider stress management techniques and ensuring adequate sleep quality.\`;  
                    nextStepsList.appendChild(li2);  
                    const li3 \= document.createElement('li');  
                    li3.innerHTML \= \`Explore the impact of blood sugar on energy levels with our \<a href="YOUR\_GLYCEMIC\_LOAD\_CALCULATOR\_LINK" target="\_blank"\>Glycemic Load Calculator\</a\>.\`;  
                    nextStepsList.appendChild(li3);  
                }

                // Add general advice if specific categories aren't heavily scored  
                if (nextStepsList.children.length \=== 0\) {  
                    const li \= document.createElement('li');  
                    li.innerHTML \= \`Focus on foundational healthy habits: Prioritize whole foods, regular movement, adequate sleep, and stress management.\`;  
                    nextStepsList.appendChild(li);  
                }  
            }

            window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top of results  
        }

        function scheduleConsultation() {  
            const firstName \= document.getElementById('leadFirstName').value.trim();  
            const email \= document.getElementById('leadEmail').value.trim();

            if (\!firstName || \!email) {  
                alert('Please enter your first name and email to schedule your consultation\!');  
                return;  
            }

            if (\!validateEmail(email)) {  
                alert('Please enter a valid email address.');  
                return;  
            }

            // In a real application, you would send this data to a backend server.  
            // For this self-contained HTML, we'll direct them to the contact page  
            // and indicate a "simulated" data capture.  
            console.log(\`Consultation Request (Simulated Capture): Name \- ${firstName}, Email \- ${email}\`);  
            console.log("Symptoms selected:", getSelectedSymptomsText());

            alert(\`Thanks, ${firstName}\! You'll be redirected to our contact page. Please fill out the form there to schedule your FREE 15-minute consultation. We look forward to discussing your results\!\`);

            // Redirect to the contact page  
            window.location.href \= 'https://huntersholistichealth.com/contact';  
              
            // Optionally clear the form fields \*after\* the alert and before redirection (though redirection makes it less critical)  
            document.getElementById('leadFirstName').value \= '';  
            document.getElementById('leadEmail').value \= '';  
        }

        function getSelectedSymptomsText() {  
            const selectedSymptoms \= \[\];  
            document.querySelectorAll('\#quizSection input\[type="checkbox"\]:checked').forEach(checkbox \=\> {  
                selectedSymptoms.push(symptomMap\[checkbox.id\].text);  
            });  
            return selectedSymptoms.join(', ');  
        }

        function validateEmail(email) {  
            const re \= /^\[^\\s@\]+@\[^\\s@\]+\\.\[^\\s@\]+$/;  
            return re.test(String(email).toLowerCase());  
        }  
    \</script\>  
\</body\>  
\</html\>  
\`\`\`  
Metabolic health decoder

\<\!DOCTYPE html\>  
\<html lang="en"\>  
\<head\>  
    \<meta charset="UTF-8"\>  
    \<meta name="viewport" content="width=device-width, initial-scale=1.0"\>  
    \<title\>Metabolic-Friendly Label Reading Guide\</title\>  
    \<script src="https://cdn.tailwindcss.com"\>\</script\>  
    \<link rel="preconnect" href="https://fonts.googleapis.com"\>  
    \<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin\>  
    \<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800\&display=swap" rel="stylesheet"\>  
    \<style\>  
        body {  
            font-family: 'Inter', sans-serif;  
        }  
        .gradient-bg {  
            background: linear-gradient(135deg, \#1e40af 0%, \#059669 100%);  
        }  
        .card-shadow {  
            box-shadow: 0 10px 25px \-5px rgba(0, 0, 0, 0.1), 0 10px 10px \-5px rgba(0, 0, 0, 0.04);  
        }  
        .green-glow {  
            box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);  
        }  
        .red-glow {  
            box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);  
        }  
    \</style\>  
\</head\>  
\<body class="bg-gray-50"\>  
    \<\!-- Header \--\>  
    \<div class="gradient-bg text-white py-8"\>  
        \<div class="container mx-auto px-4 text-center"\>  
            \<h1 class="text-4xl font-bold mb-4"\>🏷️ Metabolic-Friendly Label Reading\</h1\>  
            \<p class="text-xl text-blue-100"\>Learn to decode nutrition labels like a functional medicine expert\</p\>  
        \</div\>  
    \</div\>

    \<\!-- Main Content \--\>  
    \<div class="container mx-auto px-4 py-8 max-w-6xl"\>  
          
        \<\!-- Quick Reference Card \--\>  
        \<div class="bg-white rounded-2xl card-shadow p-8 mb-8"\>  
            \<h2 class="text-3xl font-bold text-gray-800 mb-6 text-center"\>🎯 The Metabolic Label Decoder\</h2\>  
              
            \<div class="grid md:grid-cols-2 gap-8"\>  
                \<\!-- Green Light Foods \--\>  
                \<div class="bg-green-50 border-2 border-green-200 rounded-xl p-6 green-glow"\>  
                    \<h3 class="text-2xl font-bold text-green-800 mb-4 flex items-center"\>  
                        ✅ GREEN LIGHT \- Blood Sugar Friendly  
                    \</h3\>  
                    \<div class="space-y-3"\>  
                        \<div class="bg-white rounded-lg p-3 border border-green-200"\>  
                            \<strong class="text-green-700"\>Total Carbs:\</strong\> \<span class="text-gray-600"\>Less than 15g per serving\</span\>  
                        \</div\>  
                        \<div class="bg-white rounded-lg p-3 border border-green-200"\>  
                            \<strong class="text-green-700"\>Added Sugars:\</strong\> \<span class="text-gray-600"\>0-2g per serving\</span\>  
                        \</div\>  
                        \<div class="bg-white rounded-lg p-3 border border-green-200"\>  
                            \<strong class="text-green-700"\>Fiber:\</strong\> \<span class="text-gray-600"\>3g+ per serving\</span\>  
                        \</div\>  
                        \<div class="bg-white rounded-lg p-3 border border-green-200"\>  
                            \<strong class="text-green-700"\>Protein:\</strong\> \<span class="text-gray-600"\>5g+ per serving\</span\>  
                        \</div\>  
                        \<div class="bg-white rounded-lg p-3 border border-green-200"\>  
                            \<strong class="text-green-700"\>Ingredients:\</strong\> \<span class="text-gray-600"\>5 or fewer, all recognizable\</span\>  
                        \</div\>  
                    \</div\>  
                \</div\>

                \<\!-- Red Light Foods \--\>  
                \<div class="bg-red-50 border-2 border-red-200 rounded-xl p-6 red-glow"\>  
                    \<h3 class="text-2xl font-bold text-red-800 mb-4 flex items-center"\>  
                        ❌ RED LIGHT \- Blood Sugar Spikes  
                    \</h3\>  
                    \<div class="space-y-3"\>  
                        \<div class="bg-white rounded-lg p-3 border border-red-200"\>  
                            \<strong class="text-red-700"\>Total Carbs:\</strong\> \<span class="text-gray-600"\>More than 30g per serving\</span\>  
                        \</div\>  
                        \<div class="bg-white rounded-lg p-3 border border-red-200"\>  
                            \<strong class="text-red-700"\>Added Sugars:\</strong\> \<span class="text-gray-600"\>8g+ per serving\</span\>  
                        \</div\>  
                        \<div class="bg-white rounded-lg p-3 border border-red-200"\>  
                            \<strong class="text-red-700"\>Fiber:\</strong\> \<span class="text-gray-600"\>Less than 2g per serving\</span\>  
                        \</div\>  
                        \<div class="bg-white rounded-lg p-3 border border-red-200"\>  
                            \<strong class="text-red-700"\>Net Carbs:\</strong\> \<span class="text-gray-600"\>More than 20g (Total Carbs \- Fiber)\</span\>  
                        \</div\>  
                        \<div class="bg-white rounded-lg p-3 border border-red-200"\>  
                            \<strong class="text-red-700"\>First 3 Ingredients:\</strong\> \<span class="text-gray-600"\>Sugar, flour, or processed oils\</span\>  
                        \</div\>  
                    \</div\>  
                \</div\>  
            \</div\>  
        \</div\>

        \<\!-- Hidden Sugar Names \--\>  
        \<div class="bg-white rounded-2xl card-shadow p-8 mb-8"\>  
            \<h2 class="text-3xl font-bold text-blue-800 mb-6 text-center"\>🕵️ Hidden Sugar Detective\</h2\>  
            \<p class="text-lg text-gray-600 text-center mb-6"\>Sugar has over 60 different names\! Here are the most common ones to watch for:\</p\>  
              
            \<div class="bg-blue-50 rounded-xl p-6"\>  
                \<div class="grid md:grid-cols-3 gap-4"\>  
                    \<div class="bg-white rounded-lg p-4 border border-blue-200"\>  
                        \<h4 class="font-bold text-blue-800 mb-2"\>Obvious Sugars\</h4\>  
                        \<ul class="text-gray-600 space-y-1 text-sm"\>  
                            \<li\>• Cane sugar\</li\>  
                            \<li\>• Brown sugar\</li\>  
                            \<li\>• Honey\</li\>  
                            \<li\>• Maple syrup\</li\>  
                            \<li\>• Agave nectar\</li\>  
                        \</ul\>  
                    \</div\>  
                    \<div class="bg-white rounded-lg p-4 border border-blue-200"\>  
                        \<h4 class="font-bold text-blue-800 mb-2"\>Sneaky Syrups\</h4\>  
                        \<ul class="text-gray-600 space-y-1 text-sm"\>  
                            \<li\>• High fructose corn syrup\</li\>  
                            \<li\>• Rice syrup\</li\>  
                            \<li\>• Malt syrup\</li\>  
                            \<li\>• Barley malt\</li\>  
                            \<li\>• Coconut nectar\</li\>  
                        \</ul\>  
                    \</div\>  
                    \<div class="bg-white rounded-lg p-4 border border-blue-200"\>  
                        \<h4 class="font-bold text-blue-800 mb-2"\>Chemical Names\</h4\>  
                        \<ul class="text-gray-600 space-y-1 text-sm"\>  
                            \<li\>• Dextrose\</li\>  
                            \<li\>• Maltodextrin\</li\>  
                            \<li\>• Sucrose\</li\>  
                            \<li\>• Fructose\</li\>  
                            \<li\>• Glucose\</li\>  
                        \</ul\>  
                    \</div\>  
                \</div\>  
            \</div\>  
        \</div\>

        \<\!-- Interactive Calculator \--\>  
        \<div class="bg-white rounded-2xl card-shadow p-8 mb-8"\>  
            \<h2 class="text-3xl font-bold text-green-800 mb-6 text-center"\>🧮 Net Carb Calculator\</h2\>  
            \<p class="text-lg text-gray-600 text-center mb-6"\>Calculate the net carbs that actually impact your blood sugar\</p\>  
              
            \<div class="bg-green-50 rounded-xl p-6 max-w-md mx-auto"\>  
                \<div class="space-y-4"\>  
                    \<div\>  
                        \<label class="block text-green-800 font-semibold mb-2"\>Total Carbohydrates (g)\</label\>  
                        \<input type="number" id="totalCarbs" class="w-full p-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none" placeholder="Enter total carbs"\>  
                    \</div\>  
                    \<div\>  
                        \<label class="block text-green-800 font-semibold mb-2"\>Dietary Fiber (g)\</label\>  
                        \<input type="number" id="fiber" class="w-full p-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none" placeholder="Enter fiber"\>  
                    \</div\>  
                    \<div\>  
                        \<label class="block text-green-800 font-semibold mb-2"\>Sugar Alcohols (g) \- Optional\</label\>  
                        \<input type="number" id="sugarAlcohols" class="w-full p-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none" placeholder="Enter sugar alcohols"\>  
                    \</div\>  
                    \<button onclick="calculateNetCarbs()" class="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition duration-200"\>  
                        Calculate Net Carbs  
                    \</button\>  
                    \<div id="result" class="text-center text-2xl font-bold text-green-800 bg-white rounded-lg p-4 border-2 border-green-200 hidden"\>  
                        \<span id="netCarbsResult"\>\</span\>  
                        \<div class="text-sm font-normal text-gray-600 mt-2" id="recommendation"\>\</div\>  
                    \</div\>  
                \</div\>  
            \</div\>  
        \</div\>

        \<\!-- Pro Tips \--\>  
        \<div class="bg-white rounded-2xl card-shadow p-8"\>  
            \<h2 class="text-3xl font-bold text-blue-800 mb-6 text-center"\>💡 Pro Tips from Dr. Hunter\</h2\>  
              
            \<div class="grid md:grid-cols-2 gap-6"\>  
                \<div class="bg-blue-50 rounded-xl p-6 border border-blue-200"\>  
                    \<h3 class="text-xl font-bold text-blue-800 mb-3"\>📏 Serving Size Reality Check\</h3\>  
                    \<p class="text-gray-600 mb-3"\>Many products list unrealistic serving sizes to make nutrition facts look better.\</p\>  
                    \<div class="bg-white rounded-lg p-3 border border-blue-200"\>  
                        \<strong\>Ask yourself:\</strong\> Is this really how much I'll eat?  
                    \</div\>  
                \</div\>  
                  
                \<div class="bg-green-50 rounded-xl p-6 border border-green-200"\>  
                    \<h3 class="text-xl font-bold text-green-800 mb-3"\>🥗 Ingredient Order Matters\</h3\>  
                    \<p class="text-gray-600 mb-3"\>Ingredients are listed by weight, heaviest first.\</p\>  
                    \<div class="bg-white rounded-lg p-3 border border-green-200"\>  
                        \<strong\>Red flag:\</strong\> Sugar in the first 3 ingredients  
                    \</div\>  
                \</div\>  
                  
                \<div class="bg-blue-50 rounded-xl p-6 border border-blue-200"\>  
                    \<h3 class="text-xl font-bold text-blue-800 mb-3"\>🔍 Look Beyond "Healthy" Claims\</h3\>  
                    \<p class="text-gray-600 mb-3"\>Marketing terms like "natural" and "organic" don't mean blood sugar friendly.\</p\>  
                    \<div class="bg-white rounded-lg p-3 border border-blue-200"\>  
                        \<strong\>Focus on:\</strong\> The actual numbers, not the front label  
                    \</div\>  
                \</div\>  
                  
                \<div class="bg-green-50 rounded-xl p-6 border border-green-200"\>  
                    \<h3 class="text-xl font-bold text-green-800 mb-3"\>⚖️ The Fiber-to-Sugar Ratio\</h3\>  
                    \<p class="text-gray-600 mb-3"\>Aim for at least 1g of fiber for every 5g of total carbs.\</p\>  
                    \<div class="bg-white rounded-lg p-3 border border-green-200"\>  
                        \<strong\>Golden ratio:\</strong\> 1:5 (fiber:carbs) or better  
                    \</div\>  
                \</div\>  
            \</div\>  
        \</div\>

        \<\!-- CTA Section \--\>  
        \<div class="gradient-bg text-white rounded-2xl p-8 mt-8 text-center"\>  
            \<h2 class="text-3xl font-bold mb-4"\>Ready to Master Your Metabolic Health?\</h2\>  
            \<p class="text-xl text-blue-100 mb-6"\>This label reading guide is just the beginning. Get my complete Metabolic Reset Roadmap for the full ROOTS Framework.\</p\>  
            \<button class="bg-white text-blue-800 font-bold py-4 px-8 rounded-lg text-lg hover:bg-gray-100 transition duration-200"\>  
                Get the Complete Roadmap  
            \</button\>  
        \</div\>  
    \</div\>

    \<script\>  
        function calculateNetCarbs() {  
            const totalCarbs \= parseFloat(document.getElementById('totalCarbs').value) || 0;  
            const fiber \= parseFloat(document.getElementById('fiber').value) || 0;  
            const sugarAlcohols \= parseFloat(document.getElementById('sugarAlcohols').value) || 0;  
              
            if (totalCarbs \=== 0\) {  
                alert('Please enter total carbohydrates');  
                return;  
            }  
              
            // Net carbs \= Total carbs \- Fiber \- (Sugar alcohols / 2\)  
            const netCarbs \= totalCarbs \- fiber \- (sugarAlcohols / 2);  
            const finalNetCarbs \= Math.max(0, netCarbs); // Can't be negative  
              
            document.getElementById('netCarbsResult').textContent \= \`${finalNetCarbs.toFixed(1)}g Net Carbs\`;  
              
            let recommendation \= '';  
            let recommendationClass \= '';  
              
            if (finalNetCarbs \<= 10\) {  
                recommendation \= '🟢 Excellent choice for blood sugar stability\!';  
                recommendationClass \= 'text-green-600';  
            } else if (finalNetCarbs \<= 20\) {  
                recommendation \= '🟡 Moderate choice \- pair with protein and healthy fats';  
                recommendationClass \= 'text-yellow-600';  
            } else {  
                recommendation \= '🔴 High net carbs \- may cause blood sugar spike';  
                recommendationClass \= 'text-red-600';  
            }  
              
            const recElement \= document.getElementById('recommendation');  
            recElement.textContent \= recommendation;  
            recElement.className \= \`text-sm font-normal mt-2 ${recommendationClass}\`;  
              
            document.getElementById('result').classList.remove('hidden');  
        }  
          
        // Allow Enter key to calculate  
        document.addEventListener('keypress', function(e) {  
            if (e.key \=== 'Enter') {  
                calculateNetCarbs();  
            }  
        });  
    \</script\>  
\</body\>  
\</html\>