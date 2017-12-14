import Promise from 'bluebird';
import React, { Component } from 'react';

export default function Preload(promises) {
  return function decorator(Child) {
    return class extends Component {
      constructor(props) {
        super(props)

        this.state = {
          loading: true,
          error: false
        }
      }

      componentDidMount() {

        Promise
          .props(promises)
          .then((response) => {
            this.setState((prevState, props) => {
              return {
                ...prevState,
                loading: false,
                results: response
              }
            })
          })
          .catch((errorResponse) => {
            this.setState((prevState, props) => {
              return {
                ...prevState,
                loading: false,
                error: errorResponse
              };
            })
          });
      }

      render() {
        const { loading, error } = this.state;
        if (error) {
          return <pre>{error.stack.toString()}</pre>;
        }

        if (loading) {
          return <div>Loading...</div>
        }

        return <Child {...this.props} {...this.state.results} />
      }
    }
  }
}
