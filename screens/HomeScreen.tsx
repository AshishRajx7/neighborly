// HomeScreen.tsx
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
  Housing: "#E67E22",       // Burnt Orange
  Food: "#E74C3C",          // Coral
  Services: "#1ABC9C",       // Teal
  "Lost & Found": "#9B59B6", // Light Lilac
  Events: "#E84393",        // Magenta
  Other: "#95A5A6",         // Slate Gray
};

const HomeScreen: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        console.log("HomeScreen: Fetching posts from Firestore...");
        setError(null);

        const q = query(collection(db, "posts"), limit(3));
        const querySnapshot = await getDocs(q);

        console.log("HomeScreen: Query completed, docs count:", querySnapshot.size);

        const data: Post[] = [];
        querySnapshot.forEach((doc) => {
          const postData = doc.data();
          console.log("HomeScreen: Post data:", { id: doc.id, ...postData });
          data.push({
            id: doc.id,
            title: postData.title || "Untitled",
            description: postData.description || "No description",
            category: postData.category || "Other"
          });
        });

        console.log("HomeScreen: Processed posts:", data);
        setPosts(data);

        if (data.length === 0) {
          console.log("HomeScreen: No posts found in Firestore");
        }

      } catch (error) {
        console.error("HomeScreen: Error fetching posts:", error);
        setError(`Failed to load posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handlePostPress = (postId: string) => {
    navigation.navigate("PostDetails", { id: postId });
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      const fetchPosts = async () => {
        try {
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
        } catch (error) {
          console.error("Error fetching posts:", error);
          setError(`Failed to load posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
          setLoading(false);
        }
      };
      fetchPosts();
    }, 100);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator animating size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Loading posts...</Text>
        <Text style={styles.debugText}>Connecting to Firebase...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <IconButton
          icon="refresh"
          size={24}
          onPress={handleRetry}
          iconColor="#007BFF" // Correct prop for IconButton
        />
        <Button
          mode="outlined"
          onPress={() => navigation.navigate("Browse")}
          style={styles.button}
          textColor="#007BFF" // Correct prop for outlined Button text
        >
          Go to Browse Anyway
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>👋 Welcome to Neighborly</Text>
      <Text style={styles.subHeader}>See what's happening nearby</Text>

      {posts.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.noPostsText}>No posts yet. Be the first to add one!</Text>
          <Text style={styles.debugText}>Posts loaded: {posts.length}</Text>
        </View>
      ) : (
        <View style={styles.postsSection}>
          <Text style={styles.sectionTitle}>Recent Posts</Text>
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Card
                style={[
                  styles.card,
                  { backgroundColor: categoryColors[item.category] || "#F7F9FC" }
                ]}
                onPress={() => handlePostPress(item.id)}
              >
                <Card.Title
                  title={item.title}
                  subtitle={item.category}
                  titleStyle={styles.cardTitle}
                  subtitleStyle={styles.cardSubtitle}
                />
                <Card.Content>
                  <Text numberOfLines={2} ellipsizeMode="tail">
                    {item.description}
                  </Text>
                </Card.Content>
              </Card>
            )}
            showsVerticalScrollIndicator={false}
          />
          <Text style={styles.debugText}>Showing {posts.length} recent posts</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate("Browse")}
          style={styles.button}
          icon="view-list"
        >
          Browse All Posts
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F7F9FC",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#6B8E23",
  },
  subHeader: {
    fontSize: 16,
    marginBottom: 20,
    color: "#7f8c8d",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#2c3e50",
  },
  postsSection: {
    flex: 1,
    marginBottom: 20,
  },
  card: {
    marginBottom: 12,
    elevation: 3,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  cardSubtitle: {
    color: "#7f8c8d",
  },
  buttonContainer: {
    paddingVertical: 10,
  },
  button: {
    paddingVertical: 8,
    borderRadius: 25,
    backgroundColor: "#007BFF",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F7F9FC",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#7f8c8d",
  },
  debugText: {
    marginTop: 8,
    fontSize: 12,
    color: "#95a5a6",
    textAlign: "center",
  },
  noPostsText: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: "#E74C3C",
    textAlign: "center",
    marginBottom: 16,
  },
});

export default HomeScreen;