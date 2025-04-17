import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Icon lib
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BookType } from '@/types/book';
import FlatList = Animated.FlatList;

export default function Dashboard() {
	const {user} = useUser();
	const {signOut} = useAuth();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const [books, setBooks] = useState([]);
	
	useEffect(() => {
		const fetchBooks = async () => {
			const storedBooks = await AsyncStorage.getItem('books');
			if (!storedBooks) return
			setBooks(JSON.parse(storedBooks));
		};
		fetchBooks();
	}, []);
	
	const handleLogout = async () => {
		await signOut();
		router.replace('/login');
	};
	
	const handleScan = () => {
		router.push('/scan');
	};
	
	const renderBookItem = ({item}: { item: BookType }) => (
		<View style={styles.bookItem} key={item.isbn}>
			<Text style={styles.bookTitle}>{item.title}</Text>
			<Text style={styles.bookDetails}>Author: {item.author}</Text>
			<Text style={styles.bookDetails}>ISBN: {item.isbn}</Text>
			<Text style={styles.bookDetails}>Pages: {item.numberOfPages}</Text>
			<Text style={styles.bookDetails}>
				Scanned At: {new Date(item.timestamp).toLocaleString()}
			</Text>
		</View>
	);
	
	return (
		<View style={[styles.container, {paddingTop: insets.top}]}>
			<TouchableOpacity style={styles.logoutIcon} onPress={handleLogout}>
				<Ionicons name="log-out-outline" size={28} color="#333"/>
			</TouchableOpacity>
			
			<Text style={styles.title}>Dashboard</Text>
			
			<Text style={styles.welcomeText}>
				Welcome, {user?.primaryEmailAddress?.emailAddress} 🎉
			</Text>
			
			<TouchableOpacity style={styles.button} onPress={handleScan}>
				<Text style={styles.buttonText}>Scan ISBN</Text>
			</TouchableOpacity>
			
			{!!books.length && (
				<>
					<Text style={styles.subTitle}>
						Books
					</Text>
					<FlatList
						data={books}
						renderItem={renderBookItem}
						keyExtractor={(item: BookType) => item.id}
						contentContainerStyle={styles.bookList}
					/>
				</>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 8
	},
	logoutIcon: {
		position: 'absolute',
		top: 32,
		right: 32,
		zIndex: 1,
	},
	title: {
		fontSize: 32,
		fontWeight: 'bold',
		marginTop: 60,
		marginBottom: 24,
		textAlign: 'center'
	},
	subTitle: {
		fontSize: 28,
		fontWeight: 'bold',
		marginTop: 10,
		marginBottom: 10,
		marginRight: 'auto'
	},
	welcomeText: {
		fontSize: 18,
		marginBottom: 32,
		marginRight: 'auto',
		fontWeight: 500,
		color: '#333',
		textAlign: 'center',
	},
	button: {
		backgroundColor: '#007bff',
		width: '100%',
		padding: 14,
		borderRadius: 8,
		alignItems: 'center',
		marginBottom: 16,
	},
	buttonText: {
		color: '#fff',
		fontSize: 18,
		fontWeight: 'bold',
	},
	bookList: {
		width: '100%',
	},
	bookItem: {
		backgroundColor: '#fff',
		padding: 16,
		borderRadius: 8,
		marginBottom: 12,
		elevation: 2,
	},
	bookTitle: {
		fontSize: 20,
		fontWeight: 'bold',
	},
	bookDetails: {
		fontSize: 16,
		color: '#555',
	},
});
