// screens/PostDetailsScreen.tsx
import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import {
  ActivityIndicator,
  Card,
  Chip,
  Text,
  IconButton,
  Button,   // ✅ added Button
} from "react-native-paper";
import {
  RouteProp,
  useRoute,
  useNavigation,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { doc, getDoc, deleteDoc } from "firebase/firestore";   // ✅ correct import
import { auth, db } from "../firebaseConfig";                 // ✅ correct import
import type { RootStackParamList } from "../App";

type DetailsRoute = RouteProp<RootStackParamList, "PostDetails">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Post {
  id?: string;
  title?: string;
  description?: string;
  category?: string;
  createdAt?: any;
  userId?: string;          
  authorEmail?: string;
}

const categoryColors: Record<string, string> = {
  Housing: "#FFECB3",
  Food: "#FFCDD2",
  Services: "#BBDEFB",
  "Lost & Found": "#C8E6C9",
  Events: "#D1C4E9",
  Other: "#FFE0B2",
};

const categoryIcons: Record<string, string> = {
  Housing: "home-outline",
  Food: "food-outline",
  Services: "hammer-wrench",
  "Lost & Found": "magnify",
  Events: "calendar-outline",
  Other: "dots-horizontal",
};

const isColorDark = (hex: string): boolean => {
  const color = hex.replace("#", "");
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128;
};

const PostDetailsScreen: React.FC = () => {
  const { params } = useRoute<DetailsRoute>();
  const navigation = useNavigation<NavigationProp>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPost = async () => {
      if (!params?.id) {
        setError("Invalid post ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const postRef = doc(db, "posts", params.id);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) {
          setError("Post not found");
        } else {
          const postData = { id: postSnap.id, ...postSnap.data() } as Post;
          setPost(postData);
        }
      } catch (err) {
        console.error("Error loading post:", err);
        setError("Failed to load post. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [params?.id]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  // ✅ fixed handleDelete
  const handleDelete = async () => {
    if (!post?.id) return;

    try {
      await deleteDoc(doc(db, "posts", post.id));
      Alert.alert("Deleted", "Your post has been deleted.");
      navigation.goBack();
    } catch (err) {
      console.error("Error deleting post:", err);
      Alert.alert("Error", "Could not delete post.");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator animating size="large" />
        <Text style={styles.loadingText}>Loading post...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <IconButton icon="refresh" size={24} onPress={handleBackPress} />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Post not found.</Text>
      </View>
    );
  }

  const category = post.category || "Other";
  const backgroundColor = categoryColors[category] || categoryColors.Other;
  const isDark = isColorDark(backgroundColor);
  const textColor = isDark ? "#FFFFFF" : "#212121";
  const iconName = categoryIcons[category] || categoryIcons.Other;
  const isOwner = auth.currentUser?.uid === post.userId;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={handleBackPress}
          style={styles.backButton}
        />
      </View>

      <Card style={[styles.card, { backgroundColor }]} elevation={4}>
        <Card.Title
          title={post.title || "Untitled Post"}
          titleStyle={[styles.title, { color: textColor }]}
          subtitle={category}
          subtitleStyle={[styles.subtitle, { color: textColor }]}
          left={(props) => (
            <IconButton {...props} icon={iconName} iconColor={textColor} size={28} />
          )}
        />

        <Card.Content style={styles.content}>
          {post.description && (
            <Text style={[styles.description, { color: textColor }]}>
              {post.description}
            </Text>
          )}

          <View style={styles.chipContainer}>
            <Chip
              icon={iconName}
              style={[
                styles.chip,
                {
                  backgroundColor: isDark
                    ? "rgba(255, 255, 255, 0.2)"
                    : "rgba(0, 0, 0, 0.1)",
                },
              ]}
              textStyle={[styles.chipText, { color: textColor }]}
            >
              {category}
            </Chip>
          </View>

          {post.authorEmail && (
            <Text style={[styles.meta, { color: textColor }]}>
              Posted by {post.authorEmail}
            </Text>
          )}

          {post.createdAt?.toDate && (
            <Text style={[styles.meta, { color: textColor }]}>
              {post.createdAt.toDate().toLocaleString()}
            </Text>
          )}

          {/* ✅ Show delete button if user is the owner */}
          {isOwner && (
            <Button
              mode="contained"
              onPress={handleDelete}
              style={{ marginTop: 20, backgroundColor: "red" }}
            >
              Delete Post
            </Button>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingTop: 8 },
  backButton: { margin: 0 },
  card: { margin: 16, marginTop: 8, borderRadius: 16, paddingBottom: 16 },
  title: { fontWeight: "bold", fontSize: 20, marginBottom: 4 },
  subtitle: { fontSize: 14, opacity: 0.9 },
  content: { paddingTop: 8 },
  description: { fontSize: 16, lineHeight: 24, marginBottom: 16 },
  chipContainer: { flexDirection: "row", flexWrap: "wrap", marginBottom: 8 },
  chip: { alignSelf: "flex-start", marginRight: 8, marginBottom: 8 },
  chipText: { fontWeight: "600", fontSize: 12 },
  meta: { fontSize: 13, opacity: 0.85, marginTop: 4 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  loadingText: { marginTop: 12, fontSize: 16, color: "#666" },
  errorText: { fontSize: 16, color: "#B00020", textAlign: "center", marginBottom: 16 },
});

export default PostDetailsScreen;
