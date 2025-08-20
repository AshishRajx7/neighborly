import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, FlatList, RefreshControl, Alert } from "react-native";
import {
  Text,
  Card,
  Searchbar,
  IconButton,
  FAB,
  Appbar,
} from "react-native-paper";
import { collection, getDocs, orderBy, query, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../App";

interface Post {
  id: string;
  title: string;
  description: string;
  category: string;
  createdAt?: any;
  authorEmail?: string;
}

const categoryColors: Record<string, string> = {
  Housing: "#B0BEC5",
  Food: "#CFD8DC",
  Services: "#B2DFDB",
  "Lost & Found": "#C5CAE9",
  Events: "#F48FB1",
  Other: "#E0E0E0",
};

const categoryIcons: Record<string, string> = {
  Housing: "home-outline",
  Food: "food-outline",
  Services: "tools",
  "Lost & Found": "magnify",
  Events: "calendar-outline",
  Other: "dots-horizontal",
};

const BrowseScreen: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const fetchPosts = useCallback(async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) setRefreshing(true);
      else setLoading(true);

      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      const data: Post[] = snapshot.docs.map((docSnap) => {
        const docData = docSnap.data();
        return {
          id: docSnap.id,
          title: docData.title || "Untitled",
          description: docData.description || "No description",
          category: docData.category || "Other",
          createdAt: docData.createdAt || null,
          authorEmail: docData.authorEmail || "Unknown",
        };
      });

      console.log("Firestore posts fetched:", data); // ✅ debug output

      setPosts(data);
      setFilteredPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
      Alert.alert("Error", "Failed to load posts.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const deletePost = async (id: string) => {
    try {
      await deleteDoc(doc(db, "posts", id));
      Alert.alert("Deleted", "The post has been deleted.");
      fetchPosts(); // refresh list
    } catch (error) {
      console.error("Error deleting post:", error);
      Alert.alert("Error", "Could not delete post.");
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [fetchPosts])
  );

  const applyFilters = useCallback(() => {
    let filtered = posts;

    if (selectedCategory) {
      filtered = filtered.filter((post) => post.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter((post) =>
        [post.title, post.description, post.category].join(" ").toLowerCase().includes(lowerQuery)
      );
    }

    setFilteredPosts(filtered);
  }, [posts, searchQuery, selectedCategory]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const renderPostItem = ({ item }: { item: Post }) => {
    const backgroundColor = categoryColors[item.category] || "#F4F6F8";
    const textColor = "#2C3E50";

    return (
      <Card
        onPress={() => navigation.navigate("PostDetails", { id: item.id })}
        style={[styles.card, { backgroundColor }]}
        elevation={3}
      >
        <Card.Title
          title={item.title}
          subtitle={item.category}
          left={(props) => (
            <IconButton
              {...props}
              icon={categoryIcons[item.category] || categoryIcons.Other}
              iconColor={textColor}
            />
          )}
        />
        <Card.Content>
          <Text style={styles.desc} numberOfLines={3}>
            {item.description}
          </Text>
          <Text style={styles.meta}>
            By {item.authorEmail}{" "}
            {item.createdAt?.toDate ? ` • ${item.createdAt.toDate().toLocaleString()}` : ""}
          </Text>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color="#FFFFFF" />
        <Appbar.Content title="Browse Posts" titleStyle={{ color: "#FFFFFF" }} />
        <Appbar.Action icon="refresh" onPress={() => fetchPosts(true)} color="#FFFFFF" />
      </Appbar.Header>

      <Searchbar
        placeholder="Search posts..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.search}
      />

      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        renderItem={renderPostItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchPosts(true)} />}
        contentContainerStyle={styles.list}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate("NewPost")}
        label="New Post"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F8" },
  appbar: { backgroundColor: "#2C3E50" },
  search: { margin: 10 },
  list: { padding: 10 },
  card: { marginBottom: 12, borderRadius: 12 },
  desc: { fontSize: 14, marginBottom: 6 },
  meta: { fontSize: 12, color: "#555" },
  fab: { position: "absolute", right: 16, bottom: 16 },
});

export default BrowseScreen;
