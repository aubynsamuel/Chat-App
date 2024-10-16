// import React, {useRef, useCallback} from 'react';
// import {View, Text, Button} from 'react-native';
// import {BottomSheetModal, BottomSheetModalProvider} from '@gorhom/bottom-sheet';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';

// const App = () => {
//   const bottomSheetModalRef = useRef(null);

//   const handlePresentPress = useCallback(() => {
//     bottomSheetModalRef.current?.present();
//   }, []);

//   const handleClosePress = useCallback(() => {
//     bottomSheetModalRef.current?.dismiss();
//   }, []);

//   return (
//     <GestureHandlerRootView>
//       <BottomSheetModalProvider>
//         <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
//           <Button title="Open Bottom Sheet" onPress={handlePresentPress} />
//           <BottomSheetModal
//             ref={bottomSheetModalRef}
//             index={0}
//             snapPoints={['50%', '90%']}
//             enablePanDownToClose={true}>
//             <View
//               style={{
//                 flex: 1,
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 backgroundColor: 'red',
//               }}>
//               <Text>Bottom Sheet Content</Text>
//               <Button title="Close" onPress={handleClosePress} />
//             </View>
//           </BottomSheetModal>
//         </View>
//       </BottomSheetModalProvider>
//     </GestureHandlerRootView>
//   );
// };

// export default App;
