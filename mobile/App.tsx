import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './components/ui/Button';
import { Input } from './components/ui/Input';
import { Colors, FontSize, Radius, Shadow, Spacing } from './constants/theme';
import { AuthProvider, type User, useAuth } from './context/AuthContext';
import { getPredefinedQuestions, askQuestion } from './services/qa';
import {
  checkBackendHealth,
  clearBackendUrlOverride,
  getBackendUrl,
  getDefaultBackendUrl,
  setBackendUrlOverride,
} from './services/api';
import {
  loginUser,
  logoutUser,
  registerStudent,
  registerTeacher,
  getProfile,
} from './services/auth';
import {
  createGroup,
  discoverGroups,
  getGroupMessages,
  getMyGroups,
  joinGroup,
  leaveGroup,
  sendGroupMessage,
} from './services/groups';
import {
  createQuiz,
  getQuizzes,
  getQuizResults,
  submitQuiz,
} from './services/quiz';
import { getResources } from './services/resources';

type AppTab = 'home' | 'resources' | 'quizzes' | 'groups' | 'assistant' | 'profile';
type AuthMode = 'login' | 'register';
type Role = 'student' | 'teacher';

type ResourceItem = {
  _id: string;
  title: string;
  subject: string;
  semester: string;
  type: string;
  branch: string;
  description?: string;
  filePath: string;
  uploadedAt?: string;
};

type QuizQuestion = {
  question: string;
  options: string[];
  correct: number;
};

type QuizItem = {
  _id: string;
  name: string;
  duration: number;
  branch: string;
  semester: string;
  subject: string;
  numQuestions: number;
  questions: QuizQuestion[];
  createdAt?: string;
};

type QuizResultItem = {
  _id: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt?: string;
  quizId?: string;
};

type GroupItem = {
  _id: string;
  name: string;
  description?: string;
  tags?: string[];
  studyGoal: string;
  availability: string;
  branch: string;
  semester: string;
  memberCount?: number;
  isMember?: boolean;
};

type GroupMessageItem = {
  _id: string;
  userName: string;
  message?: string;
  createdAt?: string;
};

type AssistantHistoryItem = {
  question: string;
  answer: string;
  source: 'assistant' | 'error';
};

const BRANCH_OPTIONS = ['COMPS', 'IT', 'AIDS', 'EXTC'];
const SEMESTER_OPTIONS = [
  'Semester 1',
  'Semester 2',
  'Semester 3',
  'Semester 4',
  'Semester 5',
  'Semester 6',
  'Semester 7',
  'Semester 8',
];
const DEPARTMENT_OPTIONS = [
  'Computer Science',
  'Information Technology',
  'Electronics & Telecommunication',
  'Artificial Intelligence',
  'Mathematics',
  'Other',
];
const SUBJECT_OPTIONS = [
  'Data Structures',
  'Database Management',
  'Digital Logic & Computer Organization',
  'Discrete Structures & Graph Theory',
  'Mathematics',
  'Programming Languages',
  'Other',
];
const EXPERIENCE_OPTIONS = [
  '0-1 years',
  '2-3 years',
  '4-5 years',
  '6-10 years',
  '11-15 years',
  '16-20 years',
  '20+ years',
];
const STUDY_GOAL_OPTIONS = ['Exam Prep', 'Homework Help', 'Long-term Learning'];
const AVAILABILITY_OPTIONS = [
  'Morning (6AM-12PM)',
  'Afternoon (12PM-6PM)',
  'Evening (6PM-12AM)',
  'Night Owl (12AM-6AM)',
];

const getFullName = (user: User | null) =>
  user ? `${user.firstName} ${user.lastName}`.trim() : '';

const formatDate = (value?: string) => {
  if (!value) return 'Just now';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const normalizeFileUrl = (backendUrl: string, filePath: string) => {
  if (!filePath) return backendUrl;
  if (/^https?:\/\//i.test(filePath)) {
    return filePath;
  }

  const normalized = filePath.replace(/\\/g, '/');
  const uploadMatch = normalized.match(/\/uploads\/([^/]+)$/);
  if (uploadMatch?.[1]) {
    return `${backendUrl}/uploads/${uploadMatch[1]}`;
  }

  const lastSegment = normalized.split('/').filter(Boolean).pop();
  if (lastSegment) {
    return `${backendUrl}/uploads/${lastSegment}`;
  }

  return `${backendUrl}/`;
};

const TabChip = ({
  label,
  active,
  onPress,
  icon,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  icon: keyof typeof Ionicons.glyphMap;
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.tabChip, active && styles.tabChipActive]}
    activeOpacity={0.85}
  >
    <Ionicons
      name={icon}
      size={16}
      color={active ? Colors.text : Colors.textSecondary}
    />
    <Text style={[styles.tabChipText, active && styles.tabChipTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const ChoiceChips = ({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (nextValue: string) => void;
}) => (
  <View style={styles.chipsRow}>
    {options.map((option) => {
      const active = option === value;
      return (
        <TouchableOpacity
          key={option}
          onPress={() => onChange(option)}
          style={[styles.choiceChip, active && styles.choiceChipActive]}
          activeOpacity={0.8}
        >
          <Text style={[styles.choiceChipText, active && styles.choiceChipTextActive]}>
            {option}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const EmptyState = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyStateTitle}>{title}</Text>
    <Text style={styles.emptyStateSubtitle}>{subtitle}</Text>
  </View>
);

function MobileApp() {
  const { user, login, logout, updateUser, isLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [selectedRole, setSelectedRole] = useState<Role>('student');
  const [backendUrl, setBackendUrl] = useState(getDefaultBackendUrl());
  const [backendDraft, setBackendDraft] = useState(getDefaultBackendUrl());
  const [backendStatus, setBackendStatus] = useState('Checking backend...');
  const [backendHealthy, setBackendHealthy] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [contentLoading, setContentLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });
  const [studentForm, setStudentForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    branch: BRANCH_OPTIONS[0],
    semester: SEMESTER_OPTIONS[2],
  });
  const [teacherForm, setTeacherForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    department: DEPARTMENT_OPTIONS[0],
    subject: SUBJECT_OPTIONS[0],
    employeeId: '',
    yearsExperience: EXPERIENCE_OPTIONS[3],
    hobby: '',
  });

  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResultItem[]>([]);
  const [discoverableGroups, setDiscoverableGroups] = useState<GroupItem[]>([]);
  const [myGroups, setMyGroups] = useState<GroupItem[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupMessages, setGroupMessages] = useState<GroupMessageItem[]>([]);
  const [groupMessageDraft, setGroupMessageDraft] = useState('');
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    tags: '',
    studyGoal: STUDY_GOAL_OPTIONS[0],
    availability: AVAILABILITY_OPTIONS[2],
    branch: BRANCH_OPTIONS[0],
    semester: SEMESTER_OPTIONS[2],
    maxMembers: '10',
  });

  const [assistantQuestion, setAssistantQuestion] = useState('');
  const [assistantHistory, setAssistantHistory] = useState<AssistantHistoryItem[]>([]);
  const [predefinedQuestions, setPredefinedQuestions] = useState<string[]>([]);

  const [currentQuiz, setCurrentQuiz] = useState<QuizItem | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [teacherQuizDraft, setTeacherQuizDraft] = useState({
    name: '',
    duration: '20',
    branch: BRANCH_OPTIONS[0],
    semester: SEMESTER_OPTIONS[2],
    subject: SUBJECT_OPTIONS[0],
  });
  const [teacherQuestionDraft, setTeacherQuestionDraft] = useState({
    question: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correct: '0',
  });
  const [teacherQuizQuestions, setTeacherQuizQuestions] = useState<QuizQuestion[]>([]);

  const selectedGroup = useMemo(
    () =>
      [...myGroups, ...discoverableGroups].find((group) => group._id === selectedGroupId) ?? null,
    [discoverableGroups, myGroups, selectedGroupId]
  );

  const loadBackendState = async () => {
    try {
      const resolvedUrl = await getBackendUrl();
      setBackendUrl(resolvedUrl);
      setBackendDraft(resolvedUrl);
      const health = await checkBackendHealth(resolvedUrl);
      setBackendHealthy(Boolean(health?.ok));
      setBackendStatus(health?.ok ? 'Backend is reachable.' : 'Backend responded unexpectedly.');
    } catch (error) {
      setBackendHealthy(false);
      setBackendStatus(error instanceof Error ? error.message : 'Backend check failed');
    }
  };

  const refreshAppData = async (showSpinner = false) => {
    if (!user) return;

    if (showSpinner) {
      setContentLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const [
        profileResult,
        resourcesResult,
        quizzesResult,
        discoverableGroupsResult,
        myGroupsResult,
        predefinedResult,
        quizResultsResult,
      ] = await Promise.allSettled([
        getProfile(),
        getResources(),
        getQuizzes(),
        discoverGroups(),
        getMyGroups(),
        getPredefinedQuestions(),
        user.role === 'student' ? getQuizResults() : Promise.resolve({ results: [] }),
      ]);

      if (profileResult.status === 'fulfilled' && profileResult.value?.user) {
        await updateUser(profileResult.value.user);
      }

      if (resourcesResult.status === 'fulfilled') {
        setResources(resourcesResult.value?.resources ?? []);
      }

      if (quizzesResult.status === 'fulfilled') {
        setQuizzes(quizzesResult.value?.quizzes ?? []);
      }

      if (discoverableGroupsResult.status === 'fulfilled') {
        setDiscoverableGroups(discoverableGroupsResult.value?.groups ?? []);
      }

      if (myGroupsResult.status === 'fulfilled') {
        setMyGroups(myGroupsResult.value?.groups ?? []);
      }

      if (predefinedResult.status === 'fulfilled') {
        setPredefinedQuestions(predefinedResult.value?.questions ?? []);
      }

      if (quizResultsResult.status === 'fulfilled') {
        setQuizResults(quizResultsResult.value?.results ?? []);
      }

      if (selectedGroupId) {
        try {
          const messagesResult = await getGroupMessages(selectedGroupId);
          setGroupMessages(messagesResult?.messages ?? []);
        } catch {
          setGroupMessages([]);
        }
      }
    } catch (error) {
      Alert.alert('Refresh failed', error instanceof Error ? error.message : 'Try again');
    } finally {
      setContentLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadBackendState();
  }, []);

  useEffect(() => {
    if (user) {
      void refreshAppData(true);
    } else {
      setResources([]);
      setQuizzes([]);
      setQuizResults([]);
      setDiscoverableGroups([]);
      setMyGroups([]);
      setGroupMessages([]);
      setAssistantHistory([]);
      setCurrentQuiz(null);
      setSelectedAnswers({});
      setSelectedGroupId(null);
    }
  }, [user]);

  const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password) {
      Alert.alert('Missing details', 'Please enter email and password.');
      return;
    }

    setBusyKey('login');
    try {
      const response = await loginUser(loginForm.email, loginForm.password, selectedRole);
      await login(response.token, response.user);
      setActiveTab('home');
    } catch (error) {
      Alert.alert('Login failed', error instanceof Error ? error.message : 'Please try again');
    } finally {
      setBusyKey(null);
    }
  };

  const handleRegister = async () => {
    setBusyKey('register');
    try {
      if (selectedRole === 'student') {
        const response = await registerStudent(studentForm);
        await login(response.token, response.user);
      } else {
        const response = await registerTeacher(teacherForm);
        await login(response.token, response.user);
      }
      setActiveTab('home');
    } catch (error) {
      Alert.alert(
        'Registration failed',
        error instanceof Error ? error.message : 'Please try again',
      );
    } finally {
      setBusyKey(null);
    }
  };

  const handleLogout = async () => {
    setBusyKey('logout');
    try {
      await logoutUser();
    } catch {
      // Ignore remote logout failures and clear local auth anyway.
    } finally {
      await logout();
      setBusyKey(null);
    }
  };

  const handleSaveBackendUrl = async () => {
    setBusyKey('backend');
    try {
      const resolvedUrl = await setBackendUrlOverride(backendDraft);
      setBackendUrl(resolvedUrl);
      const health = await checkBackendHealth(resolvedUrl);
      setBackendHealthy(Boolean(health?.ok));
      setBackendStatus(health?.ok ? 'Backend is reachable.' : 'Backend responded unexpectedly.');
      Alert.alert('Saved', 'Backend URL updated successfully.');
    } catch (error) {
      setBackendHealthy(false);
      setBackendStatus(error instanceof Error ? error.message : 'Backend check failed');
      Alert.alert(
        'Backend update failed',
        error instanceof Error ? error.message : 'Enter a valid URL',
      );
    } finally {
      setBusyKey(null);
    }
  };

  const handleResetBackendUrl = async () => {
    setBusyKey('backend-reset');
    try {
      const resolvedUrl = await clearBackendUrlOverride();
      setBackendUrl(resolvedUrl);
      setBackendDraft(resolvedUrl);
      const health = await checkBackendHealth(resolvedUrl);
      setBackendHealthy(Boolean(health?.ok));
      setBackendStatus(health?.ok ? 'Backend is reachable.' : 'Backend responded unexpectedly.');
    } catch (error) {
      setBackendHealthy(false);
      setBackendStatus(error instanceof Error ? error.message : 'Backend reset failed');
    } finally {
      setBusyKey(null);
    }
  };

  const openResource = async (resource: ResourceItem) => {
    const resourceUrl = normalizeFileUrl(backendUrl, resource.filePath);
    const supported = await Linking.canOpenURL(resourceUrl);
    if (!supported) {
      Alert.alert('Cannot open file', resourceUrl);
      return;
    }
    await Linking.openURL(resourceUrl);
  };

  const handleJoinGroup = async (groupId: string) => {
    setBusyKey(`join-${groupId}`);
    try {
      await joinGroup(groupId);
      await refreshAppData();
    } catch (error) {
      Alert.alert('Unable to join group', error instanceof Error ? error.message : 'Try again');
    } finally {
      setBusyKey(null);
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    setBusyKey(`leave-${groupId}`);
    try {
      await leaveGroup(groupId);
      if (selectedGroupId === groupId) {
        setSelectedGroupId(null);
        setGroupMessages([]);
      }
      await refreshAppData();
    } catch (error) {
      Alert.alert('Unable to leave group', error instanceof Error ? error.message : 'Try again');
    } finally {
      setBusyKey(null);
    }
  };

  const handleLoadGroupChat = async (groupId: string) => {
    setBusyKey(`messages-${groupId}`);
    try {
      const result = await getGroupMessages(groupId);
      setSelectedGroupId(groupId);
      setGroupMessages(result?.messages ?? []);
    } catch (error) {
      Alert.alert(
        'Unable to load messages',
        error instanceof Error ? error.message : 'Try again',
      );
    } finally {
      setBusyKey(null);
    }
  };

  const handleSendGroupMessage = async () => {
    if (!selectedGroupId || !groupMessageDraft.trim()) return;

    setBusyKey('send-message');
    try {
      await sendGroupMessage(selectedGroupId, groupMessageDraft.trim());
      setGroupMessageDraft('');
      await handleLoadGroupChat(selectedGroupId);
    } catch (error) {
      Alert.alert('Message failed', error instanceof Error ? error.message : 'Try again');
    } finally {
      setBusyKey(null);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupForm.name.trim()) {
      Alert.alert('Missing details', 'Please enter a group name.');
      return;
    }

    setBusyKey('create-group');
    try {
      await createGroup({
        name: groupForm.name.trim(),
        description: groupForm.description.trim(),
        tags: groupForm.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        studyGoal: groupForm.studyGoal,
        availability: groupForm.availability,
        maxMembers: Number(groupForm.maxMembers) || 10,
        branch: groupForm.branch,
        semester: groupForm.semester,
      });
      setGroupForm({
        name: '',
        description: '',
        tags: '',
        studyGoal: STUDY_GOAL_OPTIONS[0],
        availability: AVAILABILITY_OPTIONS[2],
        branch: BRANCH_OPTIONS[0],
        semester: SEMESTER_OPTIONS[2],
        maxMembers: '10',
      });
      await refreshAppData();
      Alert.alert('Created', 'Your group is now visible to matching users.');
    } catch (error) {
      Alert.alert('Group creation failed', error instanceof Error ? error.message : 'Try again');
    } finally {
      setBusyKey(null);
    }
  };

  const handleAskAssistant = async (question?: string) => {
    const nextQuestion = (question ?? assistantQuestion).trim();
    if (!nextQuestion) return;

    setBusyKey('assistant');
    try {
      const result = await askQuestion(nextQuestion);
      setAssistantHistory((current) => [
        {
          question: nextQuestion,
          answer: result?.answer ?? 'No answer returned.',
          source: 'assistant',
        },
        ...current,
      ]);
      setAssistantQuestion('');
    } catch (error) {
      setAssistantHistory((current) => [
        {
          question: nextQuestion,
          answer: error instanceof Error ? error.message : 'Assistant request failed',
          source: 'error',
        },
        ...current,
      ]);
    } finally {
      setBusyKey(null);
    }
  };

  const addQuestionToTeacherQuiz = () => {
    const options = [
      teacherQuestionDraft.option1,
      teacherQuestionDraft.option2,
      teacherQuestionDraft.option3,
      teacherQuestionDraft.option4,
    ].map((option) => option.trim());

    if (!teacherQuestionDraft.question.trim() || options.some((option) => !option)) {
      Alert.alert('Incomplete question', 'Please fill the question and all 4 options.');
      return;
    }

    setTeacherQuizQuestions((current) => [
      ...current,
      {
        question: teacherQuestionDraft.question.trim(),
        options,
        correct: Number(teacherQuestionDraft.correct) || 0,
      },
    ]);
    setTeacherQuestionDraft({
      question: '',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
      correct: '0',
    });
  };

  const handleCreateTeacherQuiz = async () => {
    if (!teacherQuizDraft.name.trim() || teacherQuizQuestions.length === 0) {
      Alert.alert('Missing details', 'Please add a quiz name and at least one question.');
      return;
    }

    setBusyKey('create-quiz');
    try {
      await createQuiz({
        name: teacherQuizDraft.name.trim(),
        duration: Number(teacherQuizDraft.duration) || 20,
        branch: teacherQuizDraft.branch,
        semester: teacherQuizDraft.semester,
        subject: teacherQuizDraft.subject,
        numQuestions: teacherQuizQuestions.length,
        questions: teacherQuizQuestions,
      });
      setTeacherQuizDraft({
        name: '',
        duration: '20',
        branch: BRANCH_OPTIONS[0],
        semester: SEMESTER_OPTIONS[2],
        subject: SUBJECT_OPTIONS[0],
      });
      setTeacherQuizQuestions([]);
      await refreshAppData();
      Alert.alert('Quiz created', 'Students can now access this quiz on mobile.');
    } catch (error) {
      Alert.alert('Quiz creation failed', error instanceof Error ? error.message : 'Try again');
    } finally {
      setBusyKey(null);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!user || !currentQuiz) return;

    const answers = currentQuiz.questions.map((question, index) => {
      const userAnswer = selectedAnswers[index] ?? -1;
      const correctAnswer = Number(question.correct ?? 0);
      return {
        questionIndex: index,
        question: question.question,
        userAnswer,
        correctAnswer,
        userOptionText: question.options[userAnswer] ?? 'Not answered',
        correctOptionText: question.options[correctAnswer] ?? 'Unknown',
        isCorrect: userAnswer === correctAnswer,
      };
    });

    const score = answers.filter((item) => item.isCorrect).length;
    const totalQuestions = answers.length;
    const percentage = Math.round((score / Math.max(totalQuestions, 1)) * 100);

    setBusyKey('submit-quiz');
    try {
      await submitQuiz(currentQuiz._id, {
        score,
        totalQuestions,
        percentage,
        marks: score,
        totalMarks: totalQuestions,
        answers,
        userName: getFullName(user),
        branch: user.branch,
        semester: user.semester,
      });
      Alert.alert('Quiz submitted', `You scored ${score}/${totalQuestions}.`);
      setCurrentQuiz(null);
      setSelectedAnswers({});
      await refreshAppData();
    } catch (error) {
      Alert.alert('Quiz submission failed', error instanceof Error ? error.message : 'Try again');
    } finally {
      setBusyKey(null);
    }
  };

  const renderAuthScreen = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}
    >
      <ScrollView contentContainerStyle={styles.authContainer}>
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>ClassReconnect Mobile</Text>
          <Text style={styles.heroSubtitle}>
            A mobile-ready app for students and teachers with quizzes, resources, groups, and AI
            help.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Backend Settings</Text>
          <Input
            label="Backend URL"
            value={backendDraft}
            onChangeText={setBackendDraft}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="http://192.168.1.10:3000"
            icon="server-outline"
          />
          <Text style={[styles.statusText, backendHealthy ? styles.successText : styles.warningText]}>
            {backendStatus}
          </Text>
          <View style={styles.buttonRow}>
            <Button
              title="Save URL"
              variant="secondary"
              onPress={handleSaveBackendUrl}
              loading={busyKey === 'backend'}
              style={styles.buttonFlex}
            />
            <Button
              title="Reset"
              variant="outline"
              onPress={handleResetBackendUrl}
              loading={busyKey === 'backend-reset'}
              style={styles.buttonFlex}
            />
          </View>
          <Text style={styles.helperText}>Default: {getDefaultBackendUrl()}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Auth Mode</Text>
          <ChoiceChips
            options={['login', 'register']}
            value={authMode}
            onChange={(value) => setAuthMode(value as AuthMode)}
          />

          <Text style={[styles.sectionTitle, styles.sectionTitleSpacing]}>Role</Text>
          <ChoiceChips
            options={['student', 'teacher']}
            value={selectedRole}
            onChange={(value) => setSelectedRole(value as Role)}
          />

          {authMode === 'login' ? (
            <View style={styles.sectionSpacing}>
              <Input
                label="Email"
                icon="mail-outline"
                value={loginForm.email}
                onChangeText={(value) => setLoginForm((current) => ({ ...current, email: value }))}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <Input
                label="Password"
                icon="lock-closed-outline"
                value={loginForm.password}
                onChangeText={(value) =>
                  setLoginForm((current) => ({ ...current, password: value }))
                }
                secureTextEntry
              />
              <Button
                title="Login"
                onPress={handleLogin}
                loading={busyKey === 'login'}
              />
            </View>
          ) : (
            <View style={styles.sectionSpacing}>
              {selectedRole === 'student' ? (
                <>
                  <Input
                    label="First Name"
                    value={studentForm.firstName}
                    onChangeText={(value) =>
                      setStudentForm((current) => ({ ...current, firstName: value }))
                    }
                  />
                  <Input
                    label="Last Name"
                    value={studentForm.lastName}
                    onChangeText={(value) =>
                      setStudentForm((current) => ({ ...current, lastName: value }))
                    }
                  />
                  <Input
                    label="Email"
                    value={studentForm.email}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    onChangeText={(value) =>
                      setStudentForm((current) => ({ ...current, email: value }))
                    }
                  />
                  <Input
                    label="Password"
                    value={studentForm.password}
                    onChangeText={(value) =>
                      setStudentForm((current) => ({ ...current, password: value }))
                    }
                    secureTextEntry
                  />
                  <Text style={styles.fieldLabel}>Branch</Text>
                  <ChoiceChips
                    options={BRANCH_OPTIONS}
                    value={studentForm.branch}
                    onChange={(value) =>
                      setStudentForm((current) => ({ ...current, branch: value }))
                    }
                  />
                  <Text style={[styles.fieldLabel, styles.labelSpacing]}>Semester</Text>
                  <ChoiceChips
                    options={SEMESTER_OPTIONS}
                    value={studentForm.semester}
                    onChange={(value) =>
                      setStudentForm((current) => ({ ...current, semester: value }))
                    }
                  />
                </>
              ) : (
                <>
                  <Input
                    label="First Name"
                    value={teacherForm.firstName}
                    onChangeText={(value) =>
                      setTeacherForm((current) => ({ ...current, firstName: value }))
                    }
                  />
                  <Input
                    label="Last Name"
                    value={teacherForm.lastName}
                    onChangeText={(value) =>
                      setTeacherForm((current) => ({ ...current, lastName: value }))
                    }
                  />
                  <Input
                    label="Email"
                    value={teacherForm.email}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    onChangeText={(value) =>
                      setTeacherForm((current) => ({ ...current, email: value }))
                    }
                  />
                  <Input
                    label="Password"
                    value={teacherForm.password}
                    onChangeText={(value) =>
                      setTeacherForm((current) => ({ ...current, password: value }))
                    }
                    secureTextEntry
                  />
                  <Input
                    label="Employee ID"
                    value={teacherForm.employeeId}
                    onChangeText={(value) =>
                      setTeacherForm((current) => ({ ...current, employeeId: value }))
                    }
                  />
                  <Input
                    label="Hobby"
                    value={teacherForm.hobby}
                    onChangeText={(value) =>
                      setTeacherForm((current) => ({ ...current, hobby: value }))
                    }
                  />
                  <Text style={styles.fieldLabel}>Department</Text>
                  <ChoiceChips
                    options={DEPARTMENT_OPTIONS}
                    value={teacherForm.department}
                    onChange={(value) =>
                      setTeacherForm((current) => ({ ...current, department: value }))
                    }
                  />
                  <Text style={[styles.fieldLabel, styles.labelSpacing]}>Subject</Text>
                  <ChoiceChips
                    options={SUBJECT_OPTIONS}
                    value={teacherForm.subject}
                    onChange={(value) =>
                      setTeacherForm((current) => ({ ...current, subject: value }))
                    }
                  />
                  <Text style={[styles.fieldLabel, styles.labelSpacing]}>Experience</Text>
                  <ChoiceChips
                    options={EXPERIENCE_OPTIONS}
                    value={teacherForm.yearsExperience}
                    onChange={(value) =>
                      setTeacherForm((current) => ({ ...current, yearsExperience: value }))
                    }
                  />
                </>
              )}
              <Button
                title={`Register as ${selectedRole}`}
                onPress={handleRegister}
                loading={busyKey === 'register'}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderHomeTab = () => (
    <View style={styles.sectionSpacing}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Welcome</Text>
        <Text style={styles.heroSubtitle}>
          {getFullName(user)} ({user?.role}) is signed in.
        </Text>
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{resources.length}</Text>
            <Text style={styles.metricLabel}>Resources</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{quizzes.length}</Text>
            <Text style={styles.metricLabel}>Quizzes</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{myGroups.length}</Text>
            <Text style={styles.metricLabel}>My Groups</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Connection</Text>
        <Text style={[styles.statusText, backendHealthy ? styles.successText : styles.warningText]}>
          {backendHealthy ? 'Connected' : 'Not reachable'}
        </Text>
        <Text style={styles.helperText}>{backendUrl}</Text>
      </View>

      {user?.role === 'student' && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Recent Quiz Results</Text>
          {quizResults.length === 0 ? (
            <EmptyState
              title="No results yet"
              subtitle="Take a quiz from the quizzes tab to see your scores."
            />
          ) : (
            quizResults.slice(0, 3).map((result) => (
              <View key={result._id} style={styles.listItem}>
                <View style={styles.listItemBody}>
                  <Text style={styles.listItemTitle}>
                    Score {result.score}/{result.totalQuestions}
                  </Text>
                  <Text style={styles.listItemSubtitle}>
                    {result.percentage}% • {formatDate(result.completedAt)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      )}
    </View>
  );

  const renderResourcesTab = () => (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Study Resources</Text>
      {resources.length === 0 ? (
        <EmptyState title="No resources yet" subtitle="Upload or seed resources from the backend." />
      ) : (
        resources.map((resource) => (
          <View key={resource._id} style={styles.listItem}>
            <View style={styles.listItemBody}>
              <Text style={styles.listItemTitle}>{resource.title}</Text>
              <Text style={styles.listItemSubtitle}>
                {resource.subject} • {resource.branch} • {resource.semester}
              </Text>
              {resource.description ? (
                <Text style={styles.helperText}>{resource.description}</Text>
              ) : null}
            </View>
            <Button
              title="Open"
              size="sm"
              variant="secondary"
              onPress={() => void openResource(resource)}
            />
          </View>
        ))
      )}
    </View>
  );

  const renderStudentQuizPlayer = () => {
    if (!currentQuiz) return null;

    return (
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>{currentQuiz.name}</Text>
          <Button
            title="Close"
            variant="ghost"
            size="sm"
            onPress={() => {
              setCurrentQuiz(null);
              setSelectedAnswers({});
            }}
          />
        </View>
        <Text style={styles.helperText}>
          {currentQuiz.subject} • {currentQuiz.duration} min
        </Text>
        {currentQuiz.questions.map((question, index) => (
          <View key={`${currentQuiz._id}-${index}`} style={styles.questionCard}>
            <Text style={styles.listItemTitle}>
              Q{index + 1}. {question.question}
            </Text>
            {question.options.map((option, optionIndex) => {
              const selected = selectedAnswers[index] === optionIndex;
              return (
                <TouchableOpacity
                  key={`${currentQuiz._id}-${index}-${optionIndex}`}
                  onPress={() =>
                    setSelectedAnswers((current) => ({ ...current, [index]: optionIndex }))
                  }
                  style={[styles.optionButton, selected && styles.optionButtonActive]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.optionText, selected && styles.optionTextActive]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
        <Button
          title="Submit Quiz"
          onPress={handleSubmitQuiz}
          loading={busyKey === 'submit-quiz'}
        />
      </View>
    );
  };

  const renderTeacherQuizBuilder = () => {
    if (user?.role !== 'teacher') return null;

    return (
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Create Quiz</Text>
        <Input
          label="Quiz Name"
          value={teacherQuizDraft.name}
          onChangeText={(value) => setTeacherQuizDraft((current) => ({ ...current, name: value }))}
        />
        <Input
          label="Duration (minutes)"
          value={teacherQuizDraft.duration}
          keyboardType="numeric"
          onChangeText={(value) =>
            setTeacherQuizDraft((current) => ({ ...current, duration: value }))
          }
        />
        <Text style={styles.fieldLabel}>Branch</Text>
        <ChoiceChips
          options={BRANCH_OPTIONS}
          value={teacherQuizDraft.branch}
          onChange={(value) => setTeacherQuizDraft((current) => ({ ...current, branch: value }))}
        />
        <Text style={[styles.fieldLabel, styles.labelSpacing]}>Semester</Text>
        <ChoiceChips
          options={SEMESTER_OPTIONS}
          value={teacherQuizDraft.semester}
          onChange={(value) =>
            setTeacherQuizDraft((current) => ({ ...current, semester: value }))
          }
        />
        <Text style={[styles.fieldLabel, styles.labelSpacing]}>Subject</Text>
        <ChoiceChips
          options={SUBJECT_OPTIONS}
          value={teacherQuizDraft.subject}
          onChange={(value) => setTeacherQuizDraft((current) => ({ ...current, subject: value }))}
        />

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Add Question</Text>
        <Input
          label="Question"
          value={teacherQuestionDraft.question}
          onChangeText={(value) =>
            setTeacherQuestionDraft((current) => ({ ...current, question: value }))
          }
        />
        <Input
          label="Option 1"
          value={teacherQuestionDraft.option1}
          onChangeText={(value) =>
            setTeacherQuestionDraft((current) => ({ ...current, option1: value }))
          }
        />
        <Input
          label="Option 2"
          value={teacherQuestionDraft.option2}
          onChangeText={(value) =>
            setTeacherQuestionDraft((current) => ({ ...current, option2: value }))
          }
        />
        <Input
          label="Option 3"
          value={teacherQuestionDraft.option3}
          onChangeText={(value) =>
            setTeacherQuestionDraft((current) => ({ ...current, option3: value }))
          }
        />
        <Input
          label="Option 4"
          value={teacherQuestionDraft.option4}
          onChangeText={(value) =>
            setTeacherQuestionDraft((current) => ({ ...current, option4: value }))
          }
        />
        <Text style={styles.fieldLabel}>Correct Option</Text>
        <ChoiceChips
          options={['0', '1', '2', '3']}
          value={teacherQuestionDraft.correct}
          onChange={(value) =>
            setTeacherQuestionDraft((current) => ({ ...current, correct: value }))
          }
        />
        <View style={styles.buttonRow}>
          <Button
            title="Add Question"
            variant="secondary"
            onPress={addQuestionToTeacherQuiz}
            style={styles.buttonFlex}
          />
          <Button
            title="Create Quiz"
            onPress={handleCreateTeacherQuiz}
            loading={busyKey === 'create-quiz'}
            style={styles.buttonFlex}
          />
        </View>

        {teacherQuizQuestions.length > 0 && (
          <View style={styles.sectionSpacing}>
            <Text style={styles.helperText}>{teacherQuizQuestions.length} questions ready</Text>
            {teacherQuizQuestions.map((question, index) => (
              <Text key={`${question.question}-${index}`} style={styles.helperText}>
                {index + 1}. {question.question}
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderQuizzesTab = () => (
    <View style={styles.sectionSpacing}>
      {renderTeacherQuizBuilder()}
      {renderStudentQuizPlayer()}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Available Quizzes</Text>
        {quizzes.length === 0 ? (
          <EmptyState title="No quizzes yet" subtitle="Teachers can create one from this screen." />
        ) : (
          quizzes.map((quiz) => (
            <View key={quiz._id} style={styles.listItem}>
              <View style={styles.listItemBody}>
                <Text style={styles.listItemTitle}>{quiz.name}</Text>
                <Text style={styles.listItemSubtitle}>
                  {quiz.subject} • {quiz.branch} • {quiz.semester}
                </Text>
                <Text style={styles.helperText}>
                  {quiz.questions.length} questions • {quiz.duration} minutes
                </Text>
              </View>
              {user?.role === 'student' ? (
                <Button
                  title="Start"
                  size="sm"
                  onPress={() => {
                    setCurrentQuiz(quiz);
                    setSelectedAnswers({});
                  }}
                />
              ) : null}
            </View>
          ))
        )}
      </View>
    </View>
  );

  const renderGroupsTab = () => (
    <View style={styles.sectionSpacing}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Create Group</Text>
        <Input
          label="Group Name"
          value={groupForm.name}
          onChangeText={(value) => setGroupForm((current) => ({ ...current, name: value }))}
        />
        <Input
          label="Description"
          value={groupForm.description}
          onChangeText={(value) =>
            setGroupForm((current) => ({ ...current, description: value }))
          }
        />
        <Input
          label="Tags (comma separated)"
          value={groupForm.tags}
          onChangeText={(value) => setGroupForm((current) => ({ ...current, tags: value }))}
        />
        <Input
          label="Max Members"
          value={groupForm.maxMembers}
          keyboardType="numeric"
          onChangeText={(value) => setGroupForm((current) => ({ ...current, maxMembers: value }))}
        />
        <Text style={styles.fieldLabel}>Study Goal</Text>
        <ChoiceChips
          options={STUDY_GOAL_OPTIONS}
          value={groupForm.studyGoal}
          onChange={(value) => setGroupForm((current) => ({ ...current, studyGoal: value }))}
        />
        <Text style={[styles.fieldLabel, styles.labelSpacing]}>Availability</Text>
        <ChoiceChips
          options={AVAILABILITY_OPTIONS}
          value={groupForm.availability}
          onChange={(value) => setGroupForm((current) => ({ ...current, availability: value }))}
        />
        <Text style={[styles.fieldLabel, styles.labelSpacing]}>Branch</Text>
        <ChoiceChips
          options={BRANCH_OPTIONS}
          value={groupForm.branch}
          onChange={(value) => setGroupForm((current) => ({ ...current, branch: value }))}
        />
        <Text style={[styles.fieldLabel, styles.labelSpacing]}>Semester</Text>
        <ChoiceChips
          options={SEMESTER_OPTIONS}
          value={groupForm.semester}
          onChange={(value) => setGroupForm((current) => ({ ...current, semester: value }))}
        />
        <Button
          title="Create Group"
          onPress={handleCreateGroup}
          loading={busyKey === 'create-group'}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>My Groups</Text>
        {myGroups.length === 0 ? (
          <EmptyState title="No memberships yet" subtitle="Join a discoverable group below." />
        ) : (
          myGroups.map((group) => (
            <View key={group._id} style={styles.listItemStack}>
              <View style={styles.listItemBody}>
                <Text style={styles.listItemTitle}>{group.name}</Text>
                <Text style={styles.listItemSubtitle}>
                  {group.memberCount ?? 0} members • {group.studyGoal}
                </Text>
              </View>
              <View style={styles.buttonRow}>
                <Button
                  title="Chat"
                  size="sm"
                  variant="secondary"
                  onPress={() => void handleLoadGroupChat(group._id)}
                  loading={busyKey === `messages-${group._id}`}
                  style={styles.buttonFlex}
                />
                <Button
                  title="Leave"
                  size="sm"
                  variant="danger"
                  onPress={() => void handleLeaveGroup(group._id)}
                  loading={busyKey === `leave-${group._id}`}
                  style={styles.buttonFlex}
                />
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Discover Groups</Text>
        {discoverableGroups.length === 0 ? (
          <EmptyState title="No matching groups" subtitle="Create one to get started." />
        ) : (
          discoverableGroups.map((group) => (
            <View key={group._id} style={styles.listItem}>
              <View style={styles.listItemBody}>
                <Text style={styles.listItemTitle}>{group.name}</Text>
                <Text style={styles.listItemSubtitle}>
                  {group.branch} • {group.semester} • {group.memberCount ?? 0} members
                </Text>
                <Text style={styles.helperText}>{group.description || group.studyGoal}</Text>
              </View>
              {group.isMember ? (
                <Button
                  title="Open"
                  size="sm"
                  variant="secondary"
                  onPress={() => void handleLoadGroupChat(group._id)}
                />
              ) : (
                <Button
                  title="Join"
                  size="sm"
                  onPress={() => void handleJoinGroup(group._id)}
                  loading={busyKey === `join-${group._id}`}
                />
              )}
            </View>
          ))
        )}
      </View>

      {selectedGroup ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Group Chat: {selectedGroup.name}</Text>
          {groupMessages.length === 0 ? (
            <EmptyState title="No messages yet" subtitle="Send the first message." />
          ) : (
            groupMessages.map((message) => (
              <View key={message._id} style={styles.messageBubble}>
                <Text style={styles.messageAuthor}>{message.userName}</Text>
                <Text style={styles.messageText}>{message.message || 'Attachment sent'}</Text>
                <Text style={styles.messageTime}>{formatDate(message.createdAt)}</Text>
              </View>
            ))
          )}
          <Input
            label="Send message"
            value={groupMessageDraft}
            onChangeText={setGroupMessageDraft}
            placeholder="Type a message"
          />
          <Button
            title="Send"
            onPress={handleSendGroupMessage}
            loading={busyKey === 'send-message'}
          />
        </View>
      ) : null}
    </View>
  );

  const renderAssistantTab = () => (
    <View style={styles.sectionSpacing}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>AI Assistant</Text>
        <Input
          label="Ask a question"
          value={assistantQuestion}
          onChangeText={setAssistantQuestion}
          placeholder="Ask about resources, coding, or subjects"
        />
        <Button
          title="Ask"
          onPress={() => void handleAskAssistant()}
          loading={busyKey === 'assistant'}
        />
      </View>

      {predefinedQuestions.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Quick Questions</Text>
          <View style={styles.chipsRow}>
            {predefinedQuestions.slice(0, 8).map((question) => (
              <TouchableOpacity
                key={question}
                onPress={() => void handleAskAssistant(question)}
                style={styles.choiceChip}
                activeOpacity={0.8}
              >
                <Text style={styles.choiceChipText}>{question}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Recent Answers</Text>
        {assistantHistory.length === 0 ? (
          <EmptyState title="No questions yet" subtitle="Your assistant replies will appear here." />
        ) : (
          assistantHistory.map((item, index) => (
            <View key={`${item.question}-${index}`} style={styles.assistantCard}>
              <Text style={styles.messageAuthor}>Q: {item.question}</Text>
              <Text
                style={[
                  styles.messageText,
                  item.source === 'error' ? styles.warningText : styles.successText,
                ]}
              >
                {item.answer}
              </Text>
            </View>
          ))
        )}
      </View>
    </View>
  );

  const renderProfileTab = () => (
    <View style={styles.sectionSpacing}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <Text style={styles.profileLine}>Name: {getFullName(user)}</Text>
        <Text style={styles.profileLine}>Email: {user?.email}</Text>
        <Text style={styles.profileLine}>Role: {user?.role}</Text>
        {user?.branch ? <Text style={styles.profileLine}>Branch: {user.branch}</Text> : null}
        {user?.semester ? <Text style={styles.profileLine}>Semester: {user.semester}</Text> : null}
        {user?.department ? (
          <Text style={styles.profileLine}>Department: {user.department}</Text>
        ) : null}
        {user?.subject ? <Text style={styles.profileLine}>Subject: {user.subject}</Text> : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Backend</Text>
        <Text style={styles.helperText}>{backendUrl}</Text>
        <Text style={[styles.statusText, backendHealthy ? styles.successText : styles.warningText]}>
          {backendStatus}
        </Text>
      </View>

      <Button
        title="Logout"
        variant="danger"
        onPress={handleLogout}
        loading={busyKey === 'logout'}
      />
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.helperText}>Loading mobile app...</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar style="light" />
        {renderAuthScreen()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>ClassReconnect</Text>
          <Text style={styles.headerSubtitle}>
            {getFullName(user)} • {user.role}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => void refreshAppData()}
          style={styles.refreshButton}
          activeOpacity={0.8}
        >
          <Ionicons name="refresh" size={18} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
      >
        <TabChip
          label="Home"
          icon="home-outline"
          active={activeTab === 'home'}
          onPress={() => setActiveTab('home')}
        />
        <TabChip
          label="Resources"
          icon="library-outline"
          active={activeTab === 'resources'}
          onPress={() => setActiveTab('resources')}
        />
        <TabChip
          label="Quizzes"
          icon="help-circle-outline"
          active={activeTab === 'quizzes'}
          onPress={() => setActiveTab('quizzes')}
        />
        <TabChip
          label="Groups"
          icon="people-outline"
          active={activeTab === 'groups'}
          onPress={() => setActiveTab('groups')}
        />
        <TabChip
          label="Assistant"
          icon="sparkles-outline"
          active={activeTab === 'assistant'}
          onPress={() => setActiveTab('assistant')}
        />
        <TabChip
          label="Profile"
          icon="person-outline"
          active={activeTab === 'profile'}
          onPress={() => setActiveTab('profile')}
        />
      </ScrollView>

      {contentLoading ? (
        <View style={styles.loadingScreen}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void refreshAppData()}
              tintColor={Colors.primary}
            />
          }
        >
          {activeTab === 'home' && renderHomeTab()}
          {activeTab === 'resources' && renderResourcesTab()}
          {activeTab === 'quizzes' && renderQuizzesTab()}
          {activeTab === 'groups' && renderGroupsTab()}
          {activeTab === 'assistant' && renderAssistantTab()}
          {activeTab === 'profile' && renderProfileTab()}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MobileApp />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.background,
    padding: Spacing.xl,
  },
  authContainer: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.md,
  },
  heroTitle: {
    color: Colors.text,
    fontSize: FontSize.xxxl,
    fontWeight: '800',
  },
  heroSubtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    lineHeight: 22,
    marginTop: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: FontSize.xxl,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: Colors.textSecondary,
    marginTop: 2,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabsContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabChipText: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  tabChipTextActive: {
    color: Colors.text,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.surface2,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  metricValue: {
    color: Colors.text,
    fontSize: FontSize.xxl,
    fontWeight: '800',
  },
  metricLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: FontSize.lg,
    fontWeight: '800',
  },
  sectionTitleSpacing: {
    marginTop: Spacing.sm,
  },
  sectionSpacing: {
    gap: Spacing.md,
  },
  fieldLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  labelSpacing: {
    marginTop: Spacing.sm,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  choiceChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  choiceChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  choiceChipText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  choiceChipTextActive: {
    color: Colors.text,
  },
  statusText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  successText: {
    color: Colors.accentGreen,
  },
  warningText: {
    color: Colors.warning,
  },
  helperText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  buttonFlex: {
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface2,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  listItemStack: {
    gap: Spacing.sm,
    backgroundColor: Colors.surface2,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  listItemBody: {
    flex: 1,
    gap: 4,
  },
  listItemTitle: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  listItemSubtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
  emptyState: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emptyStateTitle: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  emptyStateSubtitle: {
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  questionCard: {
    backgroundColor: Colors.surface2,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    backgroundColor: Colors.surface3,
  },
  optionButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryDark,
  },
  optionText: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  optionTextActive: {
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  messageBubble: {
    backgroundColor: Colors.surface2,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  messageAuthor: {
    color: Colors.primaryLight,
    fontWeight: '700',
  },
  messageText: {
    color: Colors.text,
    lineHeight: 21,
  },
  messageTime: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
  },
  assistantCard: {
    backgroundColor: Colors.surface2,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  profileLine: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    lineHeight: 24,
  },
});
