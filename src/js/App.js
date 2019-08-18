import React from "react";
import ReactDOM from "react-dom";
import Web3 from "web3";

import TruffleContract from "truffle-contract";
import CarVinTracking from "../../build/contracts/CarVinTracking.json";
import data from "../data.json";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.js";
import "../styles/app.css";
import $ from "jquery";
import utf8 from "utf8";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      itemid: 0,
      itemPrice: 0,
      buyerAddress: "",
      buyerName: "",
      buyerAge: "",
      events: [{ buyer: "", id: "", address: "", blockNumber: "", userName: "", age: 0 }]
    };

    this.pic = [];

    if (typeof web3 != "undefined") {
      this.web3Provider = web3.currentProvider;
    } else {
      this.web3Provider = new Web3.providers.HttpProvider(
        "http://localhost:8545"
      );
    }

    this.web3 = new Web3(this.web3Provider);

    this.contracts = TruffleContract(CarVinTracking);
    this.contracts.setProvider(this.web3Provider);
  }

  componentDidMount() {
    $(this.buyModalBox).on("show.bs.modal", e => {
      let modalId = e.relatedTarget.value;
      let obj = data.filter(c => {
        if (c.id == modalId) return c;
      });
      let id = obj[0].id;
      let price = this.web3.toWei(parseFloat(obj[0].price || 0), "ether");

      this.setState({ itemid: id, itemPrice: price });
    });

    $(this.buyerInfoModal).on("show.bs.modal", e => {
      let id = e.relatedTarget.value;

      this.contracts
        .deployed()
        .then(instance => {
          return instance.getBuyerInfo.call(id);
        })
        .then(buyerInfo => {
          this.setState({
            buyerAddress: buyerInfo[0],
            buyerName: web3.toUtf8(buyerInfo[1]),
            buyerAge: buyerInfo[2].toString()
          });
        })
        .catch(err => {
          console.log(err.message);
        });
    });

    this.web3.eth.getAccounts((error, accounts) => {
      if (error) console.log(error);

      this.listenToEvents();
      this.listenToEvents2();
    });
  }

  listenToEvents = () => {
    this.contracts.deployed().then(instance => {
      instance
        .LogBuyCarVinTracking({}, { fromBlock: 0, toBlock: "latest" })
        .watch((error, event) => {
          if (!error) {

            console.log('watch', event)

            this.setState({
              events: this.state.events.concat({
                buyer: event.args._buyer,
                id: event.args._id.toString(),
                address: event.address,
                blockNumber: event.blockNumber,
                userName: event.args._name,
                age: event.args._age
              })
            });
          } else {
            console.error(error);
          }
          this.loadCarVINTracking();
          
          // this.pic.map( (c, i) => {
          //   console.log( i );
          // })

        });
    });
  };

  listenToEvents2 = () => {
    this.contracts.deployed().then(instance => {
      instance
        .LogBuyCarVinTracking2({}, { fromBlock: 0, toBlock: "latest" })
        .watch((error, event) => {
          if (!error) {

            console.log('watch', event)

            // this.setState({
            //   events: this.state.events.concat({
            //     buyer: event.args._buyer,
            //     id: event.args._id.toString(),
            //     address: event.address,
            //     blockNumber: event.blockNumber,
            //     userName: event.args._name,
            //     age: event.args._age
            //   })
            // });
          } else {
            console.error(error);
          }
          this.loadCarVINTracking2();
          
          // this.pic.map( (c, i) => {
          //   console.log( i );
          // })

        });
    });
  };

  loadCarVINTracking = () => {
    this.contracts
      .deployed()
      .then(instance => {
        return instance.getAllBuyers.call();
      })
      .then(buyers => {
        for (let i = 0; i < buyers.length; i++) {
          // item already sold
          if (buyers[i] !== "0x0000000000000000000000000000000000000000") {
            // images search and replace to sold image
            var imgType = $(".panel-VINTracking")
              .eq(i)
              .find("img")
              .attr("src")
              .substr(11);

            switch (imgType) {
              case "2017Toyoda.jpg":
                $(".panel-VINTracking")
                  .eq(i)
                  .find("img")
                  .attr("src", "src/images/2018Toyoda.jpg");
                break;
              case "turbofan-engine.jpg":
                $(".panel-VINTracking")
                  .eq(i)
                  .find("img")
                  .attr("src", "src/images/turbofan-engine_sold.jpg");
                break;
              case "wankel-engine.jpg":
                $(".panel-VINTracking")
                  .eq(i)
                  .find("img")
                  .attr("src", "src/images/wankel-engine_sold.jpg");
                break;
            }

            // $(".panel-VINTracking")
            //   .eq(i)
            //   .find(".btn-buy2")
            //   .text("Sold")
            //   .attr("disabled", true);
            // $(".panel-VINTracking")
            //   .eq(i)
            //   .find(".btn-buyerInfo")
            //   .removeAttr("style");
          }
        }
      })
      .catch(function(err) {
        console.log(err.message);
      });
  };


  loadCarVINTracking2 = () => {
    this.contracts
      .deployed()
      .then(instance => {
        return instance.getAllBuyers.call();
      })
      .then(buyers => {
        for (let i = 0; i < buyers.length; i++) {
          // item already sold
          if (buyers[i] !== "0x0000000000000000000000000000000000000000") {
            // images search and replace to sold image
            var imgType = $(".panel-VINTracking")
              .eq(i)
              .find("img")
              .attr("src")
              .substr(11);

            switch (imgType) {
              case "2018Toyoda.jpg":
                $(".panel-VINTracking")
                  .eq(i)
                  .find("img")
                  .attr("src", "src/images/2018ToyodaSold.jpg");
                break;
            }

            $(".panel-VINTracking")
              .eq(i)
              .find(".btn-buy2")
              .text("Sold")
              .attr("disabled", true);
            $(".panel-VINTracking")
              .eq(i)
              .find(".btn-buyerInfo")
              .removeAttr("style");
          }
        }
      })
      .catch(function(err) {
        console.log(err.message);
      });
  };

  BuyCarVINTracking = e => {
    let id = $("#id").val();
    let name = $("#name").val();
    let price = $("#price").val();
    let age = $("#age").val();

    this.web3.eth.getAccounts((error, accounts) => {
      if (error) {
        console.log(error);
      }

      let account = accounts[0];
      this.contracts
        .deployed()
        .then(instance => {
          let nameUtf8Encoded = utf8.encode(name);
          return instance.buyCarVinTracking(id, web3.toHex(nameUtf8Encoded), age, {
            from: account,
            value: price
          });
        })
        .then(() => {
          $("#name").val("");
          $('#age').val('');
          $("#buyModal").modal("hide");
        })
        .catch(err => {
          console.log(err.message);
        });
    });
  };


  BuyCarVINTracking2 = e => {
    let id = $("#id").val();
    let name = $("#name").val();
    let price = $("#price").val();
    let age = $("#age").val();

    this.web3.eth.getAccounts((error, accounts) => {
      if (error) {
        console.log(error);
      }

      let account = accounts[0];
      this.contracts
        .deployed()
        .then(instance => {
          let nameUtf8Encoded = utf8.encode(name);
          return instance.buyCarVinTracking2(id, web3.toHex(nameUtf8Encoded), age, {
            from: account,
            value: price
          });
        })
        .then(() => {
          $("#name").val("");
          $('#age').val('');
          $("#buyModal").modal("hide");
        })
        .catch(err => {
          console.log(err.message);
        });
    });
  };

  render() {
    return (
      <div className="container-fluid">
        {/* <div
          className="row"
          style={{ background: "#64b5f6", height: "50px", color: "#FFF" }}
        >
          <div className="col-sm">
            <img
              src="https://ipfs.io/ipfs/Qmb5pp2h9oVUUJDPGTGtBcqNcqZdBNbJzwMj2YPRUNdpeu"
              style={{ paddingTop: "6px" }}
            />
          </div>
          <div className="col-sm-8">
            <div style={{ paddingTop: "7px" }}>
              <Menu />
            </div>
          </div>
          <div className="col-sm">
            <div style={{ paddingTop: "7px" }}>Login</div>
          </div>
        </div> */}

        <div id="events" style={{background: "darkgray"}}>
          {this.state.events.map(c => {
            return (
              <div>
                {/* {c.buyerName} -- {c.buyer} From Account {c.address} # bought this Car.  */}

                {/* { c.age.toString() !==0 ? c.age.toString() : ''} */}

                {c.age.toString() } ---

                {c.blockNumber} ---

                { web3.toUtf8(c.userName) }

              </div>
            );
          })}
        </div>

        {/* <div className="row"><ProductCarousel/></div> */}

        {/* image toggle based on true or false */}

        <div className="row">
          {data.map((c, idx) => {
            return (
              <div className="col-sm-4 card-body panel-VINTracking">
                <img
                  className="card-img-top"
                  ref={i => (this.pic[idx] = i)}
                  src={c.picture}
                  width="240"
                />

                <div className="card-body">
                  <h5 className="card-title">{c.type}</h5>
                  <p className="card-text">{c.note}</p>
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item">
                      ID: <span className="id">{c.id}</span>
                    </li>
                    <li className="list-group-item">
                      VIN: <span className="VIN">{c.VIN}</span>
                    </li>
                    <li className="list-group-item">
                      Price: <span className="price">{c.price}</span>
                    </li>
                    <li className="list-group-item">Area: {c.area}</li>
                  </ul>

                  <div className="card-body">
                    <button style={{ backgroundColor: "red" }}
                      className="btn btn-info btn-buy"
                      type="button"
                      data-toggle="modal"
                      data-target="#buyModal"
                      value={c.id}
                    >
                      Add Tracking Info
                    </button>{" "}
                    {/* &nbsp;
                     <button
                       className="btn btn-info btn-buy2"
                       type="button"
                       data-toggle="modal"
                       data-target="#buyModal2"
                       value={c.id}
                    >
                      Buy Now
                    </button> */}
                    {/* <button
                      className="btn btn-info btn-buyerInfo"
                      type="button"
                      data-toggle="modal"
                      data-target="#buyerInfoModal"
                      value={c.id}
                      style={{ display: "normal" }}
                    >
                      Buyer Info
                    </button> */}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div
          className="modal fade"
          role="dialog"
          id="buyModal"
          ref={box => (this.buyModalBox = box)}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
                <h4 className="modal-title">Car Tracking Info</h4>
              </div>
              <div className="modal-body">
                <input type="hidden" id="id" value={this.state.itemid} />
                <input type="hidden" id="price" value={this.state.itemPrice} />
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  placeholder="Add Tracking Info"
                />
                <br />
                <input type="number" className="form-control" id="age" placeholder="Year" />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-default"
                  data-dismiss="modal"
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={this.BuyCarVINTracking}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>


        <div
          className="modal fade"
          role="dialog"
          id="buyModal2"
          ref={box => (this.buyModalBox = box)}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
                <h4 className="modal-title">Buy a Car</h4>
              </div>
              <div className="modal-body">
                <input type="hidden" id="id" value={this.state.itemid} />
                <input type="hidden" id="price" value={this.state.itemPrice} />
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  placeholder="Note"
                />
                <br />
                <input type="number" className="form-control" id="age" placeholder="Year" />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-default"
                  data-dismiss="modal"
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={this.BuyCarVINTracking2}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>


        <div
          className="modal fade"
          role="dialog"
          id="buyerInfoModal"
          ref={box => (this.buyerInfoModal = box)}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
                <h4 className="modal-title">Buyer Info</h4>
              </div>
              <div className="modal-body">
                <strong>Account Info</strong>: {this.state.buyerAddress} <br />
                <strong>Name</strong>: {this.state.buyerName} <br />
                {/* <strong>Age</strong>: {this.state.buyerAge} <br/> */}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-default"
                  data-dismiss="modal"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* <div className="row">
          <div className="col-sm">
            
            <div className="input-group mb-3">
              <input type="text" className="form-control" placeholder="Search" aria-label="Search" aria-describedby="button-addon2" />
              <div className="input-group-append"></div>
                <button className="btn btn-outline-secondary" type="button" id="button-addon2">Search</button>
              </div>
            </div>
          </div>

          <div className="col-sm">
            <div className="dropdown">
              <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                Category
              </button>
              <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                <a className="dropdown-item" href="#">Action</a>
                <a className="dropdown-item" href="#">Another action</a>
                <a className="dropdown-item" href="#">Something else here</a>
              </div>
            </div>
          </div>

          <div className="col-sm">
            <div className="dropdown">
                <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  Genuine Filter Category
                </button>
                <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                  <a className="dropdown-item" href="#">Action</a>
                  <a className="dropdown-item" href="#">Another action</a>
                  <a className="dropdown-item" href="#">Something else here</a>
                </div>
              </div>
          </div>
        </div> */}

        {/* <div className="row">
          <div className="col-sm">Grid</div>
          <div className="col-sm">Drop Down Box</div>
        </div> */}
      </div>
    );
  }
}

export default App;
