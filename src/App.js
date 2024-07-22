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

const SummaryBox = ({ data }) => {
  // Set the goal to be 80% of the weekly attendance
  const completionsGoal = Math.round(data.averageWeeklyAttendance * 0.8);
  
  // Calculate the correct percentage based on the new goal
  const completionPercentage = completionsGoal > 0
    ? Math.round((data.completions.actual / completionsGoal) * 100)
    : 0;

  return (
    <Card className="mb-8 bg-white shadow-lg rounded-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4">
        <h2 className="text-2xl font-bold">Church Summary</h2>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <SummaryItem title="Weekly Attendance" value={data.averageWeeklyAttendance} />
          <SummaryItem title="Weekly Giving" value={`$${data.averageWeeklyGiving.toLocaleString()}`} />
          <SummaryItem title="Baptisms This Year" value={data.baptismsThisYear} />
          <SummaryItem title="Intent to Stay" value={data.intentToStay} />
          <SummaryItem 
            title="Completions" 
            value={`${completionPercentage}%`}
            subtext={`(${data.completions.actual}/${completionsGoal})`}
          />
        </div>
      </CardContent>
    </Card>
  );
};

const SummaryItem = ({ title, value, subtext }) => (
  <div className="bg-indigo-50 p-4 rounded-lg">
    <h3 className="text-sm font-semibold text-indigo-600 mb-1">{title}</h3>
    <p className="text-2xl font-bold text-indigo-900">{value}</p>
    {subtext && <p className="text-xs text-indigo-500 mt-1">{subtext}</p>}
  </div>
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
      console.log('Current data used for recommendations:', data);

      // Set the goal to be 80% of the weekly attendance
      const completionsGoal = Math.round(data.averageWeeklyAttendance * 0.8);
      
      // Calculate the correct percentage based on the new goal
      const completionPercentage = completionsGoal > 0
        ? Math.round((data.completions.actual / completionsGoal) * 100)
        : 0;

      const getDefinitionForScore = (score, definitions) => {
        if (score >= 67) return definitions.high;
        if (score >= 34) return definitions.medium;
        return definitions.low;
      };

      const congregantFlourishingInsights = Object.entries(data.congregantFlourishing).map(([area, areaData]) => ({
        area,
        score: areaData.score,
        definition: getDefinitionForScore(areaData.score, areaData)
      }));

      const churchThrivingInsights = {
        fromCongregants: Object.entries(data.churchThriving.fromCongregants).map(([area, areaData]) => ({
          area,
          score: areaData.score,
          definition: getDefinitionForScore(areaData.score, areaData)
        })),
        fromLeaders: Object.entries(data.churchThriving.fromLeaders).map(([area, areaData]) => ({
          area,
          score: areaData.score,
          definition: getDefinitionForScore(areaData.score, areaData)
        }))
      };

      const promptData = {
        congregantFlourishing: congregantFlourishingInsights,
        churchThriving: churchThrivingInsights,
        summary: {
          averageWeeklyAttendance: data.averageWeeklyAttendance,
          averageWeeklyGiving: data.averageWeeklyGiving,
          baptismsThisYear: data.baptismsThisYear,
          intentToStay: data.intentToStay,
          completions: {
            percentage: completionPercentage,
            actual: data.completions.actual,
            goal: completionsGoal
          }
        }
      };

      const prompt = `Based on the following church assessment data and predefined definitions, provide insights and recommendations. Use ONLY the provided definitions for each area, do not invent new recommendations.

      1. Key Insights:
         - Survey Completion: The church's completion rate is ${completionPercentage}% (${data.completions.actual} out of a goal of ${completionsGoal}, which is 80% of the weekly attendance of ${data.averageWeeklyAttendance}), compared to the average of 25%. [Brief sentence on what this means]

      2. Congregant Flourishing:
         - Strengths (scores 67-100):
           • [List areas with high scores and their corresponding definitions]
         - Growth Areas (scores 0-66):
           • [List areas with low scores and their corresponding definitions]

      3. Church Thriving:
         - Strengths (scores 67-100):
           • [List areas with high scores and their corresponding definitions]
         - Growth Areas (scores 0-66):
           • [List areas with low scores and their corresponding definitions]

      4. Next Steps to Grow:
         - Overall:
           • [3 key points based on the definitions of the lowest scoring areas]
         - Your People:
           • [3 key points based on the definitions of the lowest scoring areas in Congregant Flourishing]
         - Your Church:
           • [3 key points based on the definitions of the lowest scoring areas in Church Thriving]

      Here's the church assessment data and definitions:

      ${JSON.stringify(promptData, null, 2)}

      Provide concise, actionable insights based solely on the provided definitions. Do not generate new recommendations beyond what's given in the definitions.`;

      const completion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'gpt-4o-mini',
      });

      const recommendationsText = completion.choices[0]?.message?.content || '';

      setData(prevData => ({
        ...prevData,
        recommendations: recommendationsText
      }));
    } catch (error) {
      console.error('Error generating recommendations:', error);
      // Handle the error appropriately in your UI
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold text-indigo-800 mb-6">Church Assessment Dashboard</h2>
      <SummaryBox data={data} />
      <div className="flex space-x-4 mb-8">
        <Button 
          onClick={generateNewProfile} 
          className="bg-indigo-600 text-white px-6 py-3 rounded-full hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-1"
        >
          Generate New Profile
        </Button>
        <Button 
          onClick={generateRecommendations} 
          className="bg-emerald-600 text-white px-6 py-3 rounded-full hover:bg-emerald-700 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-1"
          disabled={isLoading}
        >
          {isLoading ? <Loader className="mr-2" /> : null}
          Generate Recommendations
        </Button>
      </div>
      {isLoading && (
        <Card className="mb-8 p-6 bg-white shadow-lg rounded-lg">
          <div className="flex items-center justify-center">
            <Loader className="mr-3 text-indigo-600" />
            <span className="text-lg font-semibold text-indigo-800">Generating Recommendations...</span>
          </div>
        </Card>
      )}
      {data.recommendations && !isLoading && (
        <Card className="mb-8 bg-white shadow-lg rounded-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4">
            <h3 className="text-2xl font-bold">Recommendations</h3>
          </CardHeader>
          <CardContent className="p-6">
            <FormattedText text={data.recommendations} />
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
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