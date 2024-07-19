import React, { useState } from 'react';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import OpenAI from 'openai';

import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Card, CardHeader, CardContent } from "./components/ui/card";
import { Textarea } from "./components/ui/textarea";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./components/ui/accordion";
import { Loader } from "./components/ui/loader";
import FormattedText from './components/FormattedText';

import initialData from './initialData.json';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const SummaryBox = ({ data }) => (
  <Card className="mb-4 shadow-sm">
    <CardHeader className="bg-blue-500 text-white p-2">
      <h2 className="text-xl font-bold">Church Summary</h2>
    </CardHeader>
    <CardContent className="p-2 grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
      <div>
        <h3 className="font-semibold">Weekly Attendance</h3>
        <p>{data.averageWeeklyAttendance}</p>
      </div>
      <div>
        <h3 className="font-semibold">Weekly Giving</h3>
        <p>${data.averageWeeklyGiving.toLocaleString()}</p>
      </div>
      <div>
        <h3 className="font-semibold">Baptisms This Year</h3>
        <p>{data.baptismsThisYear}</p>
      </div>
      <div>
        <h3 className="font-semibold">Intent to Stay</h3>
        <p>{data.intentToStay}</p>
      </div>
      <div>
        <h3 className="font-semibold">Completions</h3>
        <p>{data.completions.percentage}% ({data.completions.actual}/{data.completions.goal})</p>
      </div>
    </CardContent>
  </Card>
);

const ScoreSection = ({ title, data, category, setData, isDefineSuccess }) => {
  const [localData, setLocalData] = useState(data);

  React.useEffect(() => {
    setLocalData(data);
  }, [data]);

  const displayData = isDefineSuccess ? localData : data;

  const handleChange = (area, field, value) => {
    setLocalData(prevData => ({
      ...prevData,
      [area]: {
        ...prevData[area],
        [field]: field === 'score' ? Number(value) : value
      }
    }));
  };

  const handleSave = (area) => {
    setData(prevData => ({
      ...prevData,
      [category]: {
        ...prevData[category],
        [area]: localData[area]
      }
    }));
  };

  return (
    <Accordion type="single" collapsible defaultValue={title} className="space-y-2">
      <AccordionItem value={title}>
        <AccordionTrigger>{title}</AccordionTrigger>
        <AccordionContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(displayData).map(([area, areaData]) => (
              <Card key={area} className="overflow-hidden shadow-sm">
                <CardHeader className="bg-gray-100 p-2">
                  <h4 className="text-lg font-semibold text-gray-800">{area.replace(/([A-Z])/g, ' $1').trim()}</h4>
                </CardHeader>
                <CardContent className="p-2">
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
                    <Input
                      value={areaData.score}
                      onChange={(e) => isDefineSuccess && handleChange(area, 'score', e.target.value)}
                      type="number"
                      className="w-full p-1 border rounded text-sm"
                      readOnly={!isDefineSuccess}
                    />
                  </div>
                  {isDefineSuccess && (
                    <>
                      {['low', 'medium', 'high'].map((level) => (
                        <div key={level} className="mb-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {level.charAt(0).toUpperCase() + level.slice(1)} Definition
                          </label>
                          <Textarea
                            value={areaData[level]}
                            onChange={(e) => handleChange(area, level, e.target.value)}
                            className="w-full p-1 border rounded text-sm"
                            rows={2}
                          />
                        </div>
                      ))}
                      <Button 
                        onClick={() => handleSave(area)} 
                        className="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600 transition-colors"
                      >
                        Save Changes
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

const DefineSuccess = ({ data, setData }) => {
  return (
    <div className="space-y-4">
      <SummaryBox data={data} />
      <ScoreSection 
        title="Congregant Flourishing" 
        data={data.congregantFlourishing} 
        category="congregantFlourishing"
        setData={setData}
        isDefineSuccess={true}
      />
      <ScoreSection 
        title="Church Thriving - From Congregants" 
        data={data.churchThriving.fromCongregants} 
        category="churchThriving.fromCongregants"
        setData={setData}
        isDefineSuccess={true}
      />
      <ScoreSection 
        title="Church Thriving - From Leaders" 
        data={data.churchThriving.fromLeaders} 
        category="churchThriving.fromLeaders"
        setData={setData}
        isDefineSuccess={true}
      />
    </div>
  );
};

const ProfileGenerator = ({ data, setData }) => {
  const [isLoading, setIsLoading] = useState(false);

  const generateNewProfile = () => {
    const newData = JSON.parse(JSON.stringify(data));
    const generateRandomScores = (obj) => {
      Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          if ('score' in obj[key]) {
            obj[key].score = Math.floor(Math.random() * 101);
          } else {
            generateRandomScores(obj[key]);
          }
        }
      });
    };

    generateRandomScores(newData.congregantFlourishing);
    generateRandomScores(newData.churchThriving.fromCongregants);
    generateRandomScores(newData.churchThriving.fromLeaders);
    
    newData.averageWeeklyAttendance = Math.floor(Math.random() * 1000) + 100;
    newData.averageWeeklyGiving = Math.floor(Math.random() * 50000) + 5000;
    newData.baptismsThisYear = Math.floor(Math.random() * 100);
    newData.intentToStay = Math.floor(Math.random() * 101);
    newData.completions.percentage = Math.floor(Math.random() * 101);
    newData.completions.goal = Math.floor(Math.random() * 1000) + 100;
    newData.completions.actual = Math.floor(Math.random() * newData.completions.goal);
    
    setData(newData);
  };

  const generateRecommendations = async () => {
    setIsLoading(true);
    try {
      const promptData = {
        congregantFlourishing: data.congregantFlourishing,
        churchThriving: data.churchThriving,
        summary: {
          averageWeeklyAttendance: data.averageWeeklyAttendance,
          averageWeeklyGiving: data.averageWeeklyGiving,
          baptismsThisYear: data.baptismsThisYear,
          intentToStay: data.intentToStay,
          completions: data.completions
        }
      };
  
      const prompt = `Based on the following church assessment data, provide recommendations and insights structured exactly as follows:
  
      1. Key Insights:
         - Survey Completion: [Brief sentence comparing the church's completion rate (${data.completions.percentage}%) to the average (25%)]
  
      2. Congregant Flourishing:
         - Strengths:
           • [Strength 1: Brief explanation]
           • [Strength 2: Brief explanation]
           • [Add more if applicable]
         - Growth Areas:
           • [Growth Area 1: Brief explanation]
           • [Growth Area 2: Brief explanation]
           • [Add more if applicable]
  
      3. Church Thriving:
         - Strengths:
           • [Strength 1: Brief explanation]
           • [Strength 2: Brief explanation]
           • [Add more if applicable]
         - Growth Areas:
           • [Growth Area 1: Brief explanation]
           • [Growth Area 2: Brief explanation]
           • [Add more if applicable]
  
      4. Next Steps to Grow:
         - Overall:
           • [Step 1]
           • [Step 2]
           • [Step 3]
         - Your People:
           • [Step 1]
           • [Step 2]
           • [Step 3]
         - Your Church:
           • [Step 1]
           • [Step 2]
           • [Step 3]
  
      Please use the exact structure above, using • for bullet points. Identify strengths as scores 67-100 and growth areas as scores 0-66. Base your recommendations on the provided data and definitions for each score.
  
      Here's the church assessment data:
  
      ${JSON.stringify(promptData, null, 2)}`;
  
      const completion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'gpt-4o-mini',
      });
  
      const recommendationsText = completion.choices[0]?.message?.content || '';
      
      const recommendations = {
        keyInsights: {
          surveyCompletion: ''
        },
        congregantFlourishing: {
          strengths: [],
          growthAreas: []
        },
        churchThriving: {
          strengths: [],
          growthAreas: []
        },
        nextStepsToGrow: {
          overall: [],
          yourPeople: [],
          yourChurch: []
        }
      };
  
      // Improved parsing logic
      const sections = recommendationsText.split(/\d+\./).filter(Boolean).map(s => s.trim());
      
      sections.forEach(section => {
        const sectionLower = section.toLowerCase();
        if (sectionLower.includes('key insights')) {
          const surveyCompletionLine = section.split('\n').find(line => line.toLowerCase().includes('survey completion:'));
          if (surveyCompletionLine) {
            const [, completionText] = surveyCompletionLine.split(':');
            recommendations.keyInsights.surveyCompletion = completionText ? completionText.trim() : '';
          }
        } else if (sectionLower.includes('congregant flourishing')) {
          const [strengths, growthAreas] = section.split(/growth areas:/i);
          recommendations.congregantFlourishing.strengths = extractBulletPoints(strengths);
          recommendations.congregantFlourishing.growthAreas = extractBulletPoints(growthAreas);
        } else if (sectionLower.includes('church thriving')) {
          const [strengths, growthAreas] = section.split(/growth areas:/i);
          recommendations.churchThriving.strengths = extractBulletPoints(strengths);
          recommendations.churchThriving.growthAreas = extractBulletPoints(growthAreas);
        } else if (sectionLower.includes('next steps to grow')) {
          const [overall, yourPeople, yourChurch] = section.split(/your people:|your church:/i);
          recommendations.nextStepsToGrow.overall = extractBulletPoints(overall);
          recommendations.nextStepsToGrow.yourPeople = extractBulletPoints(yourPeople || '');
          recommendations.nextStepsToGrow.yourChurch = extractBulletPoints(yourChurch || '');
        }
      });
  
      setData(prevData => ({
        ...prevData,
        recommendations: recommendations
      }));
    } catch (error) {
      console.error('Error generating recommendations:', error);
      // Handle the error appropriately in your UI
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to extract bullet points
  const extractBulletPoints = (text) => {
    if (!text) return [];
    return text.split(/[•\-]/g)  // Split on bullet point or dash
      .map(point => point.trim())
      .filter(Boolean)
      .map(point => point.replace(/^\s*\*\s*/, ''));  // Remove leading asterisks
  };

  return (
    <div className="space-y-4">
      <SummaryBox data={data} />
      <div className="flex space-x-4 mb-4">
        <Button onClick={generateNewProfile} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">Generate New Profile</Button>
        <Button onClick={generateRecommendations} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors" disabled={isLoading}>
          {isLoading ? <Loader className="mr-2" /> : null}
          Generate Recommendations
        </Button>
      </div>
      {isLoading && (
        <Card className="mb-4 p-4 flex items-center justify-center">
          <Loader className="mr-2" /> Generating Recommendations...
        </Card>
      )}
      {data.recommendations && !isLoading && (
        <Card className="mb-4 shadow-sm">
          <CardHeader className="bg-green-500 text-white p-2">
            <h3 className="text-xl font-bold">Recommendations</h3>
          </CardHeader>
          <CardContent className="p-2">
            <Accordion type="multiple" defaultValue={['key-insights', 'congregant-flourishing', 'church-thriving', 'next-steps']} className="w-full">
              <AccordionItem value="key-insights">
                <AccordionTrigger>Key Insights</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-gray-700">
                    <FormattedText text={data.recommendations.keyInsights?.surveyCompletion || "No survey completion data available."} />
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="congregant-flourishing">
                <AccordionTrigger>Congregant Flourishing</AccordionTrigger>
                <AccordionContent>
                <h4 className="font-semibold mb-2">Strengths</h4>
                  <ul className="list-disc pl-5 mb-4">
                    {data.recommendations.congregantFlourishing?.strengths?.map((strength, index) => (
                      <li key={index} className="text-sm text-gray-700"><FormattedText text={strength} /></li>
                    ))}
                  </ul>
                  <h4 className="font-semibold mb-2">Growth Areas</h4>
                  <ul className="list-disc pl-5">
                    {data.recommendations.congregantFlourishing?.growthAreas?.map((area, index) => (
                      <li key={index} className="text-sm text-gray-700"><FormattedText text={area} /></li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="church-thriving">
                <AccordionTrigger>Church Thriving</AccordionTrigger>
                <AccordionContent>
                  <h4 className="font-semibold mb-2">Strengths</h4>
                  <ul className="list-disc pl-5 mb-4">
                    {data.recommendations.churchThriving?.strengths?.map((strength, index) => (
                      <li key={index} className="text-sm text-gray-700"><FormattedText text={strength} /></li>
                    ))}
                  </ul>
                  <h4 className="font-semibold mb-2">Growth Areas</h4>
                  <ul className="list-disc pl-5">
                    {data.recommendations.churchThriving?.growthAreas?.map((area, index) => (
                      <li key={index} className="text-sm text-gray-700"><FormattedText text={area} /></li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="next-steps">
                <AccordionTrigger>Next Steps to Grow</AccordionTrigger>
                <AccordionContent>
                  <h4 className="font-semibold mb-2">Overall</h4>
                  <ul className="list-disc pl-5 mb-4">
                    {data.recommendations.nextStepsToGrow?.overall?.map((step, index) => (
                      <li key={index} className="text-sm text-gray-700"><FormattedText text={step} /></li>
                    ))}
                  </ul>
                  <h4 className="font-semibold mb-2">Your People</h4>
                  <ul className="list-disc pl-5 mb-4">
                    {data.recommendations.nextStepsToGrow?.yourPeople?.map((step, index) => (
                      <li key={index} className="text-sm text-gray-700"><FormattedText text={step} /></li>
                    ))}
                  </ul>
                  <h4 className="font-semibold mb-2">Your Church</h4>
                  <ul className="list-disc pl-5">
                    {data.recommendations.nextStepsToGrow?.yourChurch?.map((step, index) => (
                      <li key={index} className="text-sm text-gray-700"><FormattedText text={step} /></li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      )}
      <ScoreSection 
        title="Congregant Flourishing" 
        data={data.congregantFlourishing} 
        category="congregantFlourishing"
        setData={setData}
        isDefineSuccess={false}
      />
      <ScoreSection 
        title="Church Thriving - From Congregants" 
        data={data.churchThriving.fromCongregants} 
        category="churchThriving.fromCongregants"
        setData={setData}
        isDefineSuccess={false}
      />
      <ScoreSection 
        title="Church Thriving - From Leaders" 
        data={data.churchThriving.fromLeaders} 
        category="churchThriving.fromLeaders"
        setData={setData}
        isDefineSuccess={false}
      />
    </div>
  );
};

const App = () => {
  const [data, setData] = useState(initialData);

  return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-center text-blue-800">Church Assessment Tool</h1>
      <Tabs>
        <TabList className="flex border-b mb-4">
          <Tab className="px-4 py-2 font-semibold text-gray-600 hover:text-blue-600 focus:outline-none cursor-pointer">Define Success</Tab>
          <Tab className="px-4 py-2 font-semibold text-gray-600 hover:text-blue-600 focus:outline-none cursor-pointer">Profile Generator</Tab>
        </TabList>
        <TabPanel>
          <DefineSuccess data={data} setData={setData} />
        </TabPanel>
        <TabPanel>
          <ProfileGenerator data={data} setData={setData} />
        </TabPanel>
      </Tabs>
    </div>
  );
};

export default App;