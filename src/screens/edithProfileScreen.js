import { View, StyleSheet } from 'react-native';
import { useAuth } from '../AuthContext';

const EditProfileScreen = () => {
  const {user} = useAuth()
  return (
    <View style={styles.container}>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EditProfileScreen;
