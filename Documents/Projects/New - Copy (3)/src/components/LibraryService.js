import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

class Library {
  constructor() {
    this.coursesCollection = collection(db, 'courses');
  }

  // Courses
  async getCourses() {
    const snapshot = await getDocs(this.coursesCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async addCourse(courseData) {
    const docRef = await addDoc(this.coursesCollection, courseData);
    return docRef.id;
  }

  async updateCourse(courseId, courseData) {
    const courseRef = doc(db, 'courses', courseId);
    await updateDoc(courseRef, courseData);
  }

  async deleteCourse(courseId) {
    const courseRef = doc(db, 'courses', courseId);
    await deleteDoc(courseRef);
  }

  // Chapters
  async getChapters(courseId) {
    const chaptersCollection = collection(db, `courses/${courseId}/chapters`);
    const snapshot = await getDocs(chaptersCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async addChapter(courseId, chapterData) {
    const chaptersCollection = collection(db, `courses/${courseId}/chapters`);
    const docRef = await addDoc(chaptersCollection, chapterData);
    return docRef.id;
  }

  async updateChapter(courseId, chapterId, chapterData) {
    const chapterRef = doc(db, `courses/${courseId}/chapters`, chapterId);
    await updateDoc(chapterRef, chapterData);
  }

  async deleteChapter(courseId, chapterId) {
    const chapterRef = doc(db, `courses/${courseId}/chapters`, chapterId);
    await deleteDoc(chapterRef);
  }

  // Lessons
  async getLessons(courseId, chapterId) {
    const lessonsCollection = collection(db, `courses/${courseId}/chapters/${chapterId}/lessons`);
    const snapshot = await getDocs(lessonsCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async addLesson(courseId, chapterId, lessonData) {
    const lessonsCollection = collection(db, `courses/${courseId}/chapters/${chapterId}/lessons`);
    const docRef = await addDoc(lessonsCollection, lessonData);
    return docRef.id;
  }

  async updateLesson(courseId, chapterId, lessonId, lessonData) {
    const lessonRef = doc(db, `courses/${courseId}/chapters/${chapterId}/lessons`, lessonId);
    await updateDoc(lessonRef, lessonData);
  }

  async deleteLesson(courseId, chapterId, lessonId) {
    const lessonRef = doc(db, `courses/${courseId}/chapters/${chapterId}/lessons`, lessonId);
    await deleteDoc(lessonRef);
  }

  // Homeworks
  async getHomeworks(courseId, chapterId, lessonId) {
    const homeworksCollection = collection(db, `courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/homeworks`);
    const snapshot = await getDocs(homeworksCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async addHomework(courseId, chapterId, lessonId, homeworkData) {
    const homeworksCollection = collection(db, `courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/homeworks`);
    const docRef = await addDoc(homeworksCollection, homeworkData);
    return docRef.id;
  }

  async updateHomework(courseId, chapterId, lessonId, homeworkId, homeworkData) {
    const homeworkRef = doc(db, `courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/homeworks`, homeworkId);
    await updateDoc(homeworkRef, homeworkData);
  }

  async deleteHomework(courseId, chapterId, lessonId, homeworkId) {
    const homeworkRef = doc(db, `courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/homeworks`, homeworkId);
    await deleteDoc(homeworkRef);
  }

  // Files
  async uploadFile(courseId, chapterId, lessonId, homeworkId, file) {
    const storageRef = ref(storage, `courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/homeworks/${homeworkId}/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  }

  async getFileURL(courseId, chapterId, lessonId, homeworkId, fileName) {
    const storageRef = ref(storage, `courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/homeworks/${homeworkId}/${fileName}`);
    return await getDownloadURL(storageRef);
  }

  async deleteFile(courseId, chapterId, lessonId, homeworkId, fileName) {
    const storageRef = ref(storage, `courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/homeworks/${homeworkId}/${fileName}`);
    await deleteObject(storageRef);
  }
}

const libraryInstance = new Library();
export default libraryInstance;