import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/Tabs';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import Textarea from './ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/Select';

import { 
  Plus, Trash2, Edit2, Save, X, 
  Book, Headphones, Video, Globe, Code, Music, 
  Film, Camera, Pencil, Calculator 
} from 'lucide-react';

const iconOptions = [
  { value: 'book', label: 'Book', icon: Book },
  { value: 'headphones', label: 'Headphones', icon: Headphones },
  { value: 'video', label: 'Video', icon: Video },
  { value: 'globe', label: 'Globe', icon: Globe },
  { value: 'code', label: 'Code', icon: Code },
  { value: 'music', label: 'Music', icon: Music },
  { value: 'film', label: 'Film', icon: Film },
  { value: 'camera', label: 'Camera', icon: Camera },
  { value: 'pencil', label: 'Pencil', icon: Pencil },
  { value: 'calculator', label: 'Calculator', icon: Calculator },
];

const initialTabs = [
  {
    id: 'read',
    label: 'Read',
    icon: 'book',
    items: [
      { id: 1, title: "Clean Code", description: "by Robert C. Martin" },
      { id: 2, title: "Eloquent JavaScript", description: "by Marijn Haverbeke" },
    ]
  },
  {
    id: 'listen',
    label: 'Listen',
    icon: 'headphones',
    items: [
      { id: 1, title: "Syntax", description: "Hosted by Wes Bos & Scott Tolinski" },
      { id: 2, title: "JavaScript Jabber", description: "Hosted by Charles Max Wood" },
    ]
  },
];

const TeacherRecommendations = ({ isViewOnly = false }) => {
  const [tabs, setTabs] = useState(initialTabs);
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [editingItem, setEditingItem] = useState(null);
  const [newTab, setNewTab] = useState({ label: '', icon: '' });

  const addTab = () => {
    if (newTab.label && newTab.icon) {
      const newTabId = Date.now().toString();
      setTabs([...tabs, { id: newTabId, label: newTab.label, icon: newTab.icon, items: [] }]);
      setNewTab({ label: '', icon: '' });
      setActiveTab(newTabId);
    }
  };

  const removeTab = (tabId) => {
    setTabs(tabs.filter(tab => tab.id !== tabId));
    if (activeTab === tabId) {
      setActiveTab(tabs[0].id);
    }
  };

  const addItem = (tabId) => {
    setTabs(tabs.map(tab => 
      tab.id === tabId 
        ? { ...tab, items: [...tab.items, { id: Date.now(), title: 'New Item', description: 'Description' }] }
        : tab
    ));
  };

  const removeItem = (tabId, itemId) => {
    setTabs(tabs.map(tab => 
      tab.id === tabId 
        ? { ...tab, items: tab.items.filter(item => item.id !== itemId) }
        : tab
    ));
  };

  const startEditing = (item) => {
    setEditingItem({ ...item });
  };

  const saveEdit = (tabId) => {
    setTabs(tabs.map(tab => 
      tab.id === tabId 
        ? { ...tab, items: tab.items.map(item => item.id === editingItem.id ? editingItem : item) }
        : tab
    ));
    setEditingItem(null);
  };

  const cancelEdit = () => {
    setEditingItem(null);
  };

  const RecommendationItem = ({ item, tabId }) => (
    <div className="mb-4 p-4 bg-gray-50 rounded-lg flex justify-between items-start">
      <div>
        <p className="font-semibold text-lg">{item.title}</p>
        <p className="text-sm text-gray-600">{item.description}</p>
      </div>
      {!isViewOnly && (
        <div>
          <Button variant="ghost" size="sm" onClick={() => startEditing(item)}>
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => removeItem(tabId, item.id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );

  const IconComponent = ({ iconName }) => {
    const Icon = iconOptions.find(option => option.value === iconName)?.icon;
    return Icon ? <Icon className="w-4 h-4 mr-2" /> : null;
  };

  return (
    <div className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-center mb-2">Персональные рекомендации учителя</h2>
        <p className="text-xl text-center text-gray-600 mb-8">Повысьте эффективность своего обучения с помощью этих отобранных ресурсов</p>
        
        {!isViewOnly && (
          <div className="mb-4 flex space-x-2">
            <Input 
              placeholder="New tab label" 
              value={newTab.label} 
              onChange={(e) => setNewTab({...newTab, label: e.target.value})}
            />
            <Select 
              value={newTab.icon} 
              onValueChange={(value) => setNewTab({...newTab, icon: value})}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select an icon" />
              </SelectTrigger>
              <SelectContent>
                {iconOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center">
                      <option.icon className="w-4 h-4 mr-2" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={addTab}><Plus className="w-4 h-4 mr-2" /> Add Tab</Button>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center justify-center text-lg py-3">
                <IconComponent iconName={tab.icon} />
                {tab.label}
                {!isViewOnly && (
                  <Button variant="ghost" size="sm" onClick={(e) => {
                    e.stopPropagation();
                    removeTab(tab.id);
                  }}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">{tab.label} Recommendations</CardTitle>
                  <CardDescription className="text-lg">Resources to enhance your learning</CardDescription>
                </CardHeader>
                <CardContent>
                  {editingItem && editingItem.id && (
                    <div className="mb-4">
                      <Input 
                        value={editingItem.title} 
                        onChange={(e) => setEditingItem({...editingItem, title: e.target.value})} 
                        className="mb-2"
                      />
                      <Textarea 
                        value={editingItem.description} 
                        onChange={(e) => setEditingItem({...editingItem, description: e.target.value})} 
                        className="mb-2"
                      />
                      <Button onClick={() => saveEdit(tab.id)} className="mr-2">
                        <Save className="w-4 h-4 mr-2" /> Save
                      </Button>
                      <Button onClick={cancelEdit} variant="outline">
                        <X className="w-4 h-4 mr-2" /> Cancel
                      </Button>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tab.items.map((item) => (
                      <RecommendationItem key={item.id} item={item} tabId={tab.id} />
                    ))}
                  </div>
                  {!isViewOnly && (
                    <Button onClick={() => addItem(tab.id)} className="mt-4">
                      <Plus className="w-4 h-4 mr-2" /> Add Recommendation
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default TeacherRecommendations;
