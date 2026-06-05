import { afterAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { logError, showUserError, ErrorSeverity } from '../errorHandler';
import Toast from 'react-native-toast-message';

describe('errorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'group').mockImplementation(() => {});
    jest.spyOn(console, 'groupEnd').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('logError', () => {
    it('should log to console and show error toast for ERROR severity', () => {
      const error = new Error('Test error message');
      
      logError(error, 'TestContext', ErrorSeverity.ERROR);

      expect(console.group).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Test error message');
      expect(console.log).toHaveBeenCalledWith(error.stack);
      expect(console.groupEnd).toHaveBeenCalled();

      expect(Toast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: 'Oops! Something went wrong.',
        text2: 'Test error message',
        position: 'bottom',
      });
    });

    it('should log to console but NOT show toast for WARNING severity', () => {
      const error = 'A warning occurred';
      
      logError(error, 'TestContext', ErrorSeverity.WARNING);

      expect(console.group).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('A warning occurred');
      
      expect(Toast.show).not.toHaveBeenCalled();
    });
  });

  describe('showUserError', () => {
    it('should display an error toast by default', () => {
      showUserError('Invalid password');

      expect(Toast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: 'Error',
        text2: 'Invalid password',
        position: 'bottom',
      });
    });

    it('should display a success toast when isSuccess is true', () => {
      showUserError('Operation successful', true);

      expect(Toast.show).toHaveBeenCalledWith({
        type: 'success',
        text1: 'Success',
        text2: 'Operation successful',
        position: 'bottom',
      });
    });
  });
});
