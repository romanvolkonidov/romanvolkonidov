import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { collection, getDocs, setDoc, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { Plus, Trash2, Edit2, Save, X, Book, Headphones, Video, Globe, Code, Music, Film, Camera, Pencil, Calculator } from 'lucide-react';
import '../styles/TeacherRecommendations.css';
import '../styles/global-text-styles.css';

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

const TeacherRecommendations = ({ isViewOnly = false, studentId }) => {
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [newTab, setNewTab] = useState({ label: '', icon: '' });

  useEffect(() => {
    const fetchTabs = async () => {
      try {
        const tabsSnapshot = await getDocs(collection(db, 'teacherRecommendations', studentId, 'tabs'));
        const tabsData = tabsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTabs(tabsData);
        if (tabsData.length > 0) {
          setActiveTab(tabsData[0].id);
        }
      } catch (error) {
        console.error("Error fetching tabs:", error);
      }
    };

    fetchTabs();
  }, [studentId]);

  useEffect(() => {
    const saveTabs = async () => {
      try {
        const batch = writeBatch(db);
        tabs.forEach(tab => {
          const tabRef = tab.id ? doc(db, 'teacherRecommendations', studentId, 'tabs', tab.id) : doc(collection(db, 'teacherRecommendations', studentId, 'tabs'));
          batch.set(tabRef, tab);
        });
        await batch.commit();
      } catch (error) {
        console.error("Error saving tabs:", error);
      }
    };

    if (tabs.length > 0) {
      saveTabs();
    }
  }, [tabs, studentId]);

  const addTab = () => {
    if (newTab.label && newTab.icon) {
      const newTabId = Date.now().toString();
      setTabs([...tabs, { id: newTabId, label: newTab.label, icon: newTab.icon, items: [] }]);
      setNewTab({ label: '', icon: '' });
      setActiveTab(newTabId);
    }
  };

  const removeTab = async (tabId) => {
    await deleteDoc(doc(db, 'teacherRecommendations', studentId, 'tabs', tabId));
    setTabs(tabs.filter(tab => tab.id !== tabId));
    if (activeTab === tabId && tabs.length > 0) {
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

  const autoLinkUrls = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, index) => 
      urlRegex.test(part) ? (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {part}
        </a>
      ) : (
        <React.Fragment key={index}>{part}</React.Fragment>
      )
    );
  };

  const RecommendationItem = ({ item, tabId }) => (
    <div className="mb-4 p-4 bg-gray-50 rounded-lg flex justify-between items-start">
      <div>
        <p className="font-semibold text-lg">{item.title}</p>
        <div className="text-sm text-gray-600">{autoLinkUrls(item.description)}</div>
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
    <Card className="w-full max-w-3xl mx-auto mt-6">
      <CardHeader>
      <CardTitle className="title">Персональные рекомендации преподавателя</CardTitle>
      </CardHeader>
      <CardContent>
        {!isViewOnly && (
          <div className="mb-2 flex space-x-2">
            <Input 
              placeholder="New tab label" 
              value={newTab.label} 
              onChange={(e) => setNewTab({...newTab, label: e.target.value})}
              className="text-sm"
              style={{ color: 'black' }} // Ensure input text is black
            />
            <Select 
              value={newTab.icon} 
              onValueChange={(value) => setNewTab({...newTab, icon: value})}
            >
              <SelectTrigger className="w-[120px] text-sm">
                <SelectValue placeholder="Icon" />
              </SelectTrigger>
              <SelectContent>
                {iconOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center" style={{ color: 'black' }}>
                      <option.icon className="w-3 h-3 mr-2" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button className="custom-button" onClick={addTab} size="sm"><Plus className="w-3 h-3" /></Button>
          </div>
        )}
  
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center justify-center text-sm py-1" style={{ color: 'black' }}>
                <IconComponent iconName={tab.icon} className="w-3 h-3 mr-1" />
                {tab.label}
                {!isViewOnly && (
                  <Button className="custom-button" variant="ghost" size="sm" onClick={(e) => {
                    e.stopPropagation();
                    removeTab(tab.id);
                  }}>
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="flex-grow overflow-hidden">
              <Card className="h-full flex flex-col">
                <CardHeader className="py-2">
                  <CardTitle className="text-lg break-words" style={{ color: 'black' }}>{tab.label} </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow overflow-y-auto">
                  {editingItem && editingItem.id && (
                    <div className="mb-2">
                      <Input 
                        value={editingItem.title} 
                        onChange={(e) => setEditingItem({...editingItem, title: e.target.value})} 
                        className="mb-1 text-sm"
                        style={{ color: 'black' }} // Ensure input text is black
                      />
                      <Textarea 
                        value={editingItem.description} 
                        onChange={(e) => setEditingItem({...editingItem, description: e.target.value})} 
                        className="mb-1 text-sm"
                        style={{ color: 'black' }} // Ensure textarea text is black
                      />
                      <Button className="custom-button" onClick={() => saveEdit(tab.id)} size="sm">
                        <Save className="w-3 h-3 mr-1" /> Save
                      </Button>
                      <Button className="custom-button" onClick={cancelEdit} variant="outline" size="sm">
                        <X className="w-3 h-3 mr-1" /> Cancel
                      </Button>
                    </div>
                  )}
                  <div className="grid grid-cols-1 gap-2">
                    {tab.items.map((item) => (
                      <RecommendationItem key={item.id} item={item} tabId={tab.id} />
                    ))}
                  </div>
                  {!isViewOnly && (
                    <div className="flex flex-wrap mt-2">
                      <Button className="custom-button text-sm mr-2 mb-2" onClick={() => addItem(tab.id)} size="sm">
                        <Plus className="w-3 h-3 mr-1" /> Add Recommendation
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TeacherRecommendations;