import React, { useState } from 'react';
import AchievementTracker from './ProgressBar/AchievementTracker';
import CodeGardenProgress from './ProgressBar/CodeGardenProgress';
import GamifiedProgress from './ProgressBar/GamifiedProgress';
import MilestoneProgress from './ProgressBar/MilestoneProgress';
import QuestProgress from './ProgressBar/QuestProgress';
import SkillTreeProgress from './ProgressBar/SkillTreeProgress';
import CircularProgress from './ProgressBar/CircularProgress';
import SkillTreeRPG from './ProgressBar/SkillTreeRPG';
import TimelineProgress from './ProgressBar/TimelineProgress';
import AdultsProgressTracker from './ProgressBar/AdultsProgressTracker';
import StudentProgressBar from './ProgressBar/StudentProgressBar';

const ViewOnlyProgressBars = () => {
  const [achievementState, setAchievementState] = useState({
    'Quick Learner': { completed: true, icon: Clock, description: 'Complete your first lesson' },
    'Code Warrior': { completed: false, icon: Code, description: 'Write 100 lines of code' },
    'Data Master': { completed: false, icon: Database, description: 'Create your first database' },
    'Algorithm Ace': { completed: false, icon: Cpu, description: 'Implement 5 different algorithms' },
    'Full Stack Developer': { completed: false, icon: Award, description: 'Complete all course modules' },
  });

  const [codeGardenState, setCodeGardenState] = useState([
    { name: 'Variables', stage: 2 },
    { name: 'Functions', stage: 1 },
    { name: 'Arrays', stage: 0 },
    { name: 'Objects', stage: 1 },
    { name: 'Loops', stage: 2 },
    { name: 'Conditionals', stage: 0 },
  ]);

  const [gamifiedProgress, setGamifiedProgress] = useState(75);
  const [milestoneProgress, setMilestoneProgress] = useState(2);
  const [questProgress, setQuestProgress] = useState(3);
  const [skillTreeProgress, setSkillTreeProgress] = useState(50);
  const [circularProgress, setCircularProgress] = useState(75);
  const [skillTreeRPGProgress, setSkillTreeRPGProgress] = useState(40);
  const [timelineProgress, setTimelineProgress] = useState(60);
  const [adultsProgressTracker, setAdultsProgressTracker] = useState([{ milestones: 3, progress: 50, color: '#40E0D0' }]);
  const [studentProgressBar, setStudentProgressBar] = useState(80);

  return (
    <div>
      <AchievementTracker viewOnly achievements={achievementState} />
      <CodeGardenProgress viewOnly plants={codeGardenState} />
      <GamifiedProgress viewOnly experience={gamifiedProgress} />
      <MilestoneProgress viewOnly currentStep={milestoneProgress} />
      <QuestProgress viewOnly completedQuests={questProgress} />
      <SkillTreeProgress viewOnly progress={skillTreeProgress} />
      <CircularProgress viewOnly progress={circularProgress} />
      <SkillTreeRPG viewOnly progress={skillTreeRPGProgress} />
      <TimelineProgress viewOnly progress={timelineProgress} />
      <AdultsProgressTracker viewOnly bars={adultsProgressTracker} />
      <StudentProgressBar viewOnly progress={studentProgressBar} />
    </div>
  );
};

export default ViewOnlyProgressBars;