import { db } from "../config/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  Timestamp,
  where
} from "firebase/firestore";

export interface Meal {
  id?: string;
  name: string;
  category: string;
  date: Date;
  imageUrl?: string;
  notes?: string;
  userId: string;
}

export async function addMeal(userId: string, meal: Omit<Meal, "id" | "userId">) {
  try {
    const mealsRef = collection(db, "users", userId, "meals");
    const docRef = await addDoc(mealsRef, {
      ...meal,
      date: Timestamp.fromDate(meal.date),
      userId,
      createdAt: Timestamp.now(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding meal:", error);
    return { success: false, error };
  }
}

export async function getMealHistory(userId: string, limitCount = 20) {
  try {
    const mealsRef = collection(db, "users", userId, "meals");
    const q = query(mealsRef, orderBy("date", "desc"), limit(limitCount));
    const querySnapshot = await getDocs(q);

    const meals: Meal[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      meals.push({
        id: doc.id,
        name: data.name,
        category: data.category,
        date: data.date.toDate(),
        imageUrl: data.imageUrl,
        notes: data.notes,
        userId: data.userId,
      });
    });

    return { success: true, meals };
  } catch (error) {
    console.error("Error getting meal history:", error);
    return { success: false, meals: [], error };
  }
}

export async function getRecentMeals(userId: string, days = 7) {
  try {
    const mealsRef = collection(db, "users", userId, "meals");
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const q = query(
      mealsRef,
      where("date", ">=", Timestamp.fromDate(startDate)),
      orderBy("date", "desc")
    );
    const querySnapshot = await getDocs(q);

    const meals: Meal[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      meals.push({
        id: doc.id,
        name: data.name,
        category: data.category,
        date: data.date.toDate(),
        imageUrl: data.imageUrl,
        notes: data.notes,
        userId: data.userId,
      });
    });

    return { success: true, meals };
  } catch (error) {
    console.error("Error getting recent meals:", error);
    return { success: false, meals: [], error };
  }
}
