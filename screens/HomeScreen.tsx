// screens/HomeScreen.tsx
import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { Text, Card, Button, ActivityIndicator, IconButton } from "react-native-paper";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../App";

interface Post {
  id: string;
  title: string;
  description: string;
  category: string;
}

const categoryColors: Record<string, string> = {
  Housing: "#DDEAF6",
  Food: "#FDE2E2",
  Services: "#E0F7FA",
  "Lost & Found": "#EDE7F6",
  Events: "#FFF3E0",
  Other: "#F5F5F5",
};

const HomeScreen: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setError(null);
        const q = query(collection(db, "posts"), limit(3));
        const querySnapshot = await getDocs(q);
        const data: Post[] = [];
        querySnapshot.forEach((doc) => {
          const postData = doc.data();
          data.push({
            id: doc.id,
            title: postData.title || "Untitled",
            description: postData.description || "No description",
            category: postData.category || "Other"
          });
        });
        setPosts(data);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError(`Failed to load posts: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator animating size="large" color="#000" />
        <Text style={styles.statusText}>Loading posts...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <IconButton icon="refresh" size={24} onPress={() => setLoading(true)} iconColor="#000" />
        <Button mode="outlined" onPress={() => navigation.navigate("Browse")} style={styles.button} textColor="#000">
          Browse Anyway
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>👋 Welcome to Neighborly</Text>
      <Text style={styles.subHeader}>See what's happening nearby</Text>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card
            style={[styles.card, { backgroundColor: categoryColors[item.category] || "#F5F5F5" }]}
            onPress={() => navigation.navigate("PostDetails", { id: item.id })}
          >
            <Card.Title 
              title={item.title} 
              subtitle={item.category} 
              titleStyle={styles.cardTitle} 
              subtitleStyle={styles.cardSubtitle} 
            />
            <Card.Content>
              <Text numberOfLines={2} style={styles.cardDescription}>{item.description}</Text>
            </Card.Content>
          </Card>
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.centerContent}>
            <Text style={styles.noPostsText}>No posts yet. Be the first to add one!</Text>
          </View>
        }
      />

      <Button
        mode="contained"
        onPress={() => navigation.navigate("Browse")}
        style={styles.button}
        icon="view-list"
      >
        Browse All Posts
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#000",
  },
  subHeader: {
    fontSize: 16,
    marginBottom: 20,
    color: "#000",
    fontWeight: "600",
  },
  card: {
    marginBottom: 12,
    elevation: 2,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  cardSubtitle: {
    color: "#000",
    fontWeight: "500",
  },
  cardDescription: {
    color: "#000",
    fontWeight: "400",
  },
  button: {
    marginTop: 16,
    borderRadius: 25,
    backgroundColor: "#000",
    paddingVertical: 8,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  statusText: {
    marginTop: 12,
    fontSize: 16,
    color: "#7F8C8D",
  },
  noPostsText: {
    fontSize: 16,
    color: "#000",
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#E74C3C",
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "bold",
  },
});

export default HomeScreen;
