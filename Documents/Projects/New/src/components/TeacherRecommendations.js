import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Book, Headphones, Target } from 'lucide-react';

const recommendations = {
  read: [
    { title: "Clean Code", author: "Robert C. Martin" },
    { title: "Eloquent JavaScript", author: "Marijn Haverbeke" },
    { title: "You Don't Know JS", author: "Kyle Simpson" },
  ],
  listen: [
    { title: "Syntax", host: "Wes Bos & Scott Tolinski" },
    { title: "JavaScript Jabber", host: "Charles Max Wood" },
    { title: "React Podcast", host: "Michael Chan" },
  ],
  other: [
    "Contribute to open-source projects",
    "Attend local coding meetups",
    "Build a personal project portfolio",
  ],
};

const RecommendationItem = ({ item, type }) => (
  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
    <p className="font-semibold text-lg">{item.title || item}</p>
    {type !== 'other' && <p className="text-sm text-gray-600">{item.author || item.host}</p>}
  </div>
);

const TeacherRecommendations = () => {
  return (
    <div className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-center mb-2">Teacher Recommendations</h2>
        <p className="text-xl text-center text-gray-600 mb-8">Boost your learning with these curated resources</p>
        
        <Tabs defaultValue="read" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="read" className="flex items-center justify-center text-lg py-3">
              <Book className="w-5 h-5 mr-2" />
              Read
            </TabsTrigger>
            <TabsTrigger value="listen" className="flex items-center justify-center text-lg py-3">
              <Headphones className="w-5 h-5 mr-2" />
              Listen
            </TabsTrigger>
            <TabsTrigger value="other" className="flex items-center justify-center text-lg py-3">
              <Target className="w-5 h-5 mr-2" />
              Other
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="read">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Recommended Reading</CardTitle>
                <CardDescription className="text-lg">Books to enhance your coding skills</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendations.read.map((item, index) => (
                    <RecommendationItem key={index} item={item} type="read" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="listen">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Recommended Listening</CardTitle>
                <CardDescription className="text-lg">Podcasts to stay updated with the latest in tech</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendations.listen.map((item, index) => (
                    <RecommendationItem key={index} item={item} type="listen" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="other">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Other Recommendations</CardTitle>
                <CardDescription className="text-lg">Activities to boost your career</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendations.other.map((item, index) => (
                    <RecommendationItem key={index} item={item} type="other" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TeacherRecommendations;