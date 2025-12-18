import { sendRequest } from "@/src/lib/api";
import { Ionicons } from "@expo/vector-icons";
import React, {
  FC,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";

const { width } = Dimensions.get("window");
const ITEM_SIZE = (width - 80) / 3;

type MusicTrack = {
  id: string;
  name: string;
  backgroundColor: string;
  imageUrl?: string;
  musicUrl?: string;
  locked?: boolean;
};

export const UserMusicScreen: FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const fetchUserMusic = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response: any = await sendRequest({
        url: `user/submissions?screen_id=1`,
        method: "get",
      });
      const payload = response?.data ?? response;

      // Normalize to an array of submissions
      let submissions: any[] = [];
      if (Array.isArray(payload?.data)) submissions = payload.data;
      else if (Array.isArray(payload)) submissions = payload;
      else if (payload?.submitted_data) submissions = [payload];
      else submissions = [];

      if (submissions.length === 0) {
        setTracks([]);
        setError(null);
        return;
      }

      const mapped: MusicTrack[] = submissions.map((item: any) => {
        const submitted = item.submitted_data ?? [];
        const name =
          (submitted.find((f: any) => f.key === "music_name")
            ?.value as string) || "Untitled";
        return {
          id: String(item.id ?? item.submission_number ?? Math.random()),
          name,
          backgroundColor: colorFromString(name || "#6b7280"),
          imageUrl: submitted.find((f: any) => f.key === "cover_image")?.value,
          musicUrl: submitted.find((f: any) => f.key === "music_file")?.value,
          locked: false,
        } as MusicTrack;
      });

      setTracks(mapped);
    } catch (err: any) {
      setError(err?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useLayoutEffect(() => {
    fetchUserMusic();
  }, []);

  const handleTrackPress = (track: MusicTrack) => {
    if (track.locked) return;

    if (selectedTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setSelectedTrack(track);
      setIsPlaying(true);
    }
  };

  const renderTrack = useCallback(
    (track: MusicTrack) => {
      const isSelected = selectedTrack?.id === track.id;
      const showPlayIcon = isSelected && isPlaying;

      return (
        <TouchableOpacity
          key={track.id}
          style={styles.trackContainer}
          onPress={() => handleTrackPress(track)}
          activeOpacity={0.7}
          disabled={!!track.locked}
        >
          <View style={styles.circleWrapper}>
            <View style={styles.outerBorder}>
              <View style={styles.innerBorder}>
                <View
                  style={[
                    styles.trackCircle,
                    { backgroundColor: track.backgroundColor },
                    isSelected && styles.selectedBorder,
                  ]}
                >
                  {track.locked ? (
                    <Ionicons name="lock-closed" size={28} color="white" />
                  ) : showPlayIcon ? (
                    <Ionicons name="musical-notes" size={32} color="white" />
                  ) : null}
                </View>
              </View>
            </View>
          </View>
          <Text style={styles.trackName} numberOfLines={1}>
            {track.name}
          </Text>
        </TouchableOpacity>
      );
    },
    [selectedTrack, isPlaying]
  );

  const miniTitle = useMemo(() => selectedTrack?.name || "", [selectedTrack]);

  return (
    <View style={styles.container}>
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" />
        </View>
      ) : error ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ color: "#dc2626" }}>{error}</Text>
        </View>
      ) : tracks.length === 0 ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ color: "#374151" }}>No tracks found</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.grid}>{tracks.map(renderTrack)}</View>
        </ScrollView>
      )}

      {selectedTrack && (
        <View style={styles.playerBar}>
          <View style={styles.playerInfo}>
            <View
              style={[
                styles.miniCircle,
                { backgroundColor: selectedTrack.backgroundColor },
              ]}
            >
              <Ionicons
                name={isPlaying ? "musical-notes" : "pause"}
                size={16}
                color="white"
              />
            </View>
            <View style={styles.playerText}>
              <Text style={styles.playerTitle}>{miniTitle}</Text>
              <Text style={styles.playerStatus}>
                {isPlaying ? "Now Playing" : "Paused"}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => setIsPlaying(!isPlaying)}
          >
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={24}
              color="#333"
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

function colorFromString(value: string) {
  if (!value) return "#6b7280";
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00ffffff).toString(16).toUpperCase();
  return `#${"000000".substring(0, 6 - c.length)}${c}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContent: {
    paddingBottom: 100,
    paddingTop: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 20,
    justifyContent: "space-between",
  },
  trackContainer: {
    width: ITEM_SIZE,
    alignItems: "center",
    marginBottom: 30,
  },
  circleWrapper: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  outerBorder: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: ITEM_SIZE / 2,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  innerBorder: {
    width: ITEM_SIZE - 6,
    height: ITEM_SIZE - 6,
    borderRadius: (ITEM_SIZE - 6) / 2,
    borderWidth: 1.5,
    borderColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  trackCircle: {
    width: ITEM_SIZE - 10,
    height: ITEM_SIZE - 10,
    borderRadius: (ITEM_SIZE - 10) / 2,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  selectedBorder: {
    borderWidth: 3,
    borderColor: "#10b981",
  },
  trackName: {
    marginTop: 10,
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    width: ITEM_SIZE,
  },
  playerBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  playerInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  miniCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  playerText: {
    flex: 1,
  },
  playerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  playerStatus: {
    fontSize: 12,
    color: "#666",
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
});
