import {View, Text} from 'react-native';
import React from 'react';

const PopUpMenu = () => {
  return (
    <Menu
      style={styles.container}
      customStyles={{
        optionsContainer: {
          elevation: 5,
          borderRadius: 10,
          borderCurve: 'circular',
          marginTop: 40,
          marginLeft: -30,
        },
      }}>
      <MenuTrigger>
        <TouchableOpacity>
          <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
            <Text style={isUserMessage ? styles.userTime : styles.otherTime}>
              {formatTimeWithoutSeconds(item.createdAt)}
            </Text>
            {item.read && isUserMessage && (
              <Text style={{fontSize: 10, color: 'grey', marginLeft: 5}}>
                read
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </MenuTrigger>
      <MenuOptions>
        <MenuOption onSelect={() => copyToClipboard(item.content)}>
          <Text>Copy</Text>
        </MenuOption>
        <MenuOption onSelect={() => handleReply}>
          <Text>Reply</Text>
        </MenuOption>
      </MenuOptions>
    </Menu>
  );
};

export default PopUpMenu;
