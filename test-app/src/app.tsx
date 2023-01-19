import { h, Component, render } from 'preact';
import LoginScreen from './LoginScreen';
import MainScreen from './MainScreen';
import TodoModel from './TodoModel';
import HubStore, { IHubConnectionOptions } from './HubStore';

interface IAppState {

  /** The current HubStore to use for Hub communication. */
  store?: HubStore;

  /** The current TodoModel, which manages interaction between the UI and the store. */
  model?: TodoModel;

  /** Whether the sign-in screen is currently submitting. */
  signInSubmitting?: boolean;

  /** Whether sign-in completed successfully. */
  signInComplete?: boolean;

  /** The last sign-in error, if any. */
  signInError?: string;

}

/**
 * Main entry point for the app.
 */
export class TodoApp extends Component<{}, IAppState> {

  /** The initial app state. */
  readonly state = {};

  /**
   * Invoked when the user clicks "sign in".
   */
  onSignIn = async (options: IHubConnectionOptions) => {
    let store: HubStore;

    this.setState({ signInSubmitting: true });

    try {
      // Verify that we can connect to the Hub.
      store = new HubStore(options);
      await store.connect();

      this.setState({
        store,
        model: new TodoModel(store),
        signInComplete: true
      });
    } catch (err) {
      // A problem occurred when verifying the connection.
      let errorMessage = "Failed to do something exceptional";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
  console.log(errorMessage);
      this.setState({
        signInSubmitting: false,
        signInError: errorMessage
      });
    }
  }

  /**
   * Renders the app.
   */
  render ({}, { model, signInSubmitting, signInError, signInComplete }: IAppState) {
    if (signInComplete) {
      return <MainScreen model={ model! } onTodoAdded={ model!.addTodo } onTodoToggled={ model!.toggleTodo } onTodoDeleted={ model!.deleteTodo } />;
    } else {
      return <LoginScreen onSignIn={ this.onSignIn } submitting={ signInSubmitting } signInError={ signInError } />;
    }
  }

}

/**
 * Renders a new app instance in the `app-container` element.
 */
function start () {
  render(
    <TodoApp />,
    document.getElementById('app-container')!
  );
}

start();
