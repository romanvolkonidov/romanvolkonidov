import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter 
} from 'firebase/firestore';
import { db } from '../firebase';

const fetchTableData = async (studentId, lastDoc = null, pageSize = 20) => {
  let q = query(
    collection(db, 'tableData'),
    where('studentId', '==', studentId),
    orderBy('timestamp', 'desc'),
    limit(pageSize)
  );

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  const snapshot = await getDocs(q);
  const newData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const lastVisible = snapshot.docs[snapshot.docs.length - 1];

  return { newData, lastVisible };
};

const fetchLibraryData = async () => {
  const librarySnapshot = await getDocs(collection(db, 'library'));
  return librarySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export { fetchTableData, fetchLibraryData };