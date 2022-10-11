import { StatusBar } from "expo-status-bar";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { SafeAreaView as SafeAreaViewRNSAC } from "react-native-safe-area-context";
import {
	View,
	Text,
	FlatList,
	Pressable,
	KeyboardAvoidingView,
	TextInput,
	Platform,
	SafeAreaView as SafeAreaViewRN,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import tw from "twrnc";
import { randomNumber } from "./utils";

let SafeAreaView = Platform.OS === "ios" ? SafeAreaViewRN : SafeAreaViewRNSAC;

let playersCount = 2;
let players = Array.from({ length: playersCount }, (_, i) => `P${i + 1}`);
let spaces = Array.from({ length: playersCount }, (_) => "");
let cellWidth = {
	2: "w-1/2",
	3: "w-1/3",
	4: "w-1/4",
};

let GameContext = createContext(null);

function generateGames() {
	return Array.from({ length: 0 }, () =>
		Array.from({ length: playersCount }, randomNumber),
	);
}

function loadFromStorage() {}

export default function App() {
	let [games, setGames] = useState(() => generateGames());
	let flatList = useRef<FlatList>();

	if (playersCount < 2 || playersCount > 4)
		throw new Error("Wrong players count");

	useEffect(() => {
		AsyncStorage.getItem("games").then((data) => {
			if (!data) return;
			console.warn("Games loaded");
			setGames(JSON.parse(data));
		});
	}, []);

	useEffect(() => {
		void AsyncStorage.setItem("games", JSON.stringify(games)).then(() => {
			// console.warn("Games saved");
		});
	}, [games]);

	return (
		<SafeAreaView style={tw`grow bg-gray-100`}>
			<StatusBar style="auto" />
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
			>
				<GameContext.Provider value={setGames}>
					<FlatList
						ref={flatList}
						data={games}
						renderItem={({ item }) => <RowItem item={item} />}
						onContentSizeChange={() => flatList.current.scrollToEnd()}
						ListHeaderComponent={ListHeaderComponent}
						ListFooterComponent={ListFooterComponent}
					/>
				</GameContext.Provider>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

function RowItem({ item }) {
	let setGames = useContext(GameContext);
	return (
		<Pressable
			onPress={() => setGames((g) => g.filter((i) => i !== item))}
			style={tw`mx-3 my-1 flex-row rounded-xl shadow-md bg-white`}
		>
			{item.map((data, index, array) => (
				<View
					key={index}
					style={tw.style(`p-3 border-gray-200`, cellWidth[playersCount], {
						"border-r": index < array.length - 1,
					})}
				>
					<Text style={tw`text-center`}>{data}</Text>
				</View>
			))}
		</Pressable>
	);
}

function ListFooterComponent() {
	let setGames = useContext(GameContext);
	let [inputs, setInputs] = useState(spaces);
	let [showErrors, setShowErrors] = useState(false);

	return (
		<>
			<View style={tw`flex-row rounded-xl shadow-md bg-white mx-3 my-1 px-1`}>
				{inputs.map((input, index) => (
					<View key={index} style={tw.style(cellWidth[playersCount])}>
						<TextInput
							value={input}
							style={tw.style(
								"mx-1 p-3 text-center border-b border-transparent",
								{
									"border-red-500": showErrors && !input,
								},
							)}
							keyboardType="number-pad"
							maxLength={2}
							placeholder="00"
							onChangeText={(text) => {
								let newInputs = [...inputs];
								newInputs[index] = text;
								setInputs(newInputs);
							}}
						/>
					</View>
				))}
			</View>
			<Pressable
				onPress={() => {
					if (inputs.every(Boolean)) {
						setShowErrors(false);
						setInputs([...spaces]);
						setGames((g) => [...g, inputs]);
					} else {
						setShowErrors(true);
					}
				}}
				style={tw`rounded-xl shadow-md bg-yellow-50 p-3 m-3`}
			>
				<Text style={tw`text-center`}>Add</Text>
			</Pressable>
		</>
	);
}

function ListHeaderComponent() {
	return (
		<View style={tw`m-3 flex-row rounded-xl shadow-md bg-yellow-50`}>
			{players.map((player, index, array) => (
				<View
					key={index}
					style={tw.style("p-3 border-gray-200", cellWidth[playersCount], {
						"border-r": index < array.length - 1,
					})}
				>
					<Text style={tw`text-center`}>{player}</Text>
				</View>
			))}
		</View>
	);
}
