import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import { Card, CardContent } from './ui/Card';
import { Input } from './ui/Input';
import Label from './ui/Label';
import Textarea from './ui/Textarea';
import { Button } from './ui/Button';

const StudentProfile = () => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('/api/placeholder/200/200');

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-48 h-48">
              <img
                src={image}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
              <label htmlFor="image-upload" className="absolute bottom-2 right-2 bg-white rounded-full p-2 cursor-pointer shadow-md">
                <Camera size={24} />
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            <div>
              <Label htmlFor="age">Age (optional)</Label>
              <Input
                id="age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Enter your age"
              />
            </div>
            <div>
              <Label htmlFor="description">About Me/My Child</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us about yourself or your child"
                rows={4}
              />
            </div>
            <Button className="w-full">Save Profile</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentProfile;