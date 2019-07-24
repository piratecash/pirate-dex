import React, {Component} from "react";
import assetUtils from "common/asset_utils";
import AssetActions from "actions/AssetActions";
import MarketsActions from "actions/MarketsActions";
import counterpart from "counterpart";
import PredictionMarketsOverviewTable from "./PredictionMarketsOverviewTable";
import PredictionMarketDetailsTable from "./PredictionMarketDetailsTable";
import SearchInput from "../Utility/SearchInput";
import HelpContent from "../Utility/HelpContent";
import AddOpinionModal from "./AddOpinionModal";
import CreateMarketModal from "./CreateMarketModal";
import ResolveModal from "./ResolveModal";
import {ChainStore} from "bitsharesjs";
import {Switch, Button, Radio} from "bitshares-ui-style-guide";
import {Asset, Price} from "../../lib/common/MarketClasses";
import Translate from "react-translate-component";
import LoadingIndicator from "../LoadingIndicator";
import {bindToCurrentAccount} from "../Utility/BindToCurrentAccount";
import AssetStore from "../../stores/AssetStore";
import MarketsStore from "../../stores/MarketsStore";
import {connect} from "alt-react";

class PredictionMarkets extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lastAssetSymbol: null,
            predictionMarkets: [],
            isFetchingFinished: false,
            searchTerm: "",
            detailsSearchTerm: "",
            selectedPredictionMarket: null,
            opinions: [],
            preselectedOpinion: "no",
            preselectedAmount: 0,
            preselectedProbability: 0,
            isCreateMarketModalOpen: false,
            isAddOpinionModalOpen: false,
            isResolveModalOpen: false,
            isHideUnknownHousesChecked: true,
            opinionFilter: "all"
        };

        this.onCreatePredictionMarketModalOpen = this.onCreatePredictionMarketModalOpen.bind(
            this
        );
        this.onCreatePredictionMarketModalClose = this.onCreatePredictionMarketModalClose.bind(
            this
        );
        this.onAddOpinionModalOpen = this.onAddOpinionModalOpen.bind(this);
        this.onAddOpinionModalClose = this.onAddOpinionModalClose.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.onSearchDetails = this.onSearchDetails.bind(this);
        this.onMarketAction = this.onMarketAction.bind(this);
        this.onResolveModalOpen = this.onResolveModalOpen.bind(this);
        this.onResolveModalClose = this.onResolveModalClose.bind(this);
        this.updateAsset = this.updateAsset.bind(this);
        this.handleUnknownHousesToggleChange = this.handleUnknownHousesToggleChange.bind(
            this
        );
    }

    componentWillMount() {
        this._checkAssets(this.props.assets);
    }

    componentWillReceiveProps(np) {
        console.log(np.marketLimitOrders);
        if (np.assets !== this.props.assets) {
            this._checkAssets(np.assets);
        }

        if (np.marketLimitOrders !== this.props.marketLimitOrders) {
            this._updateOpinionsList(np.marketLimitOrders);
        }
    }

    _checkAssets(fetchedAssets) {
        let searchAsset = this.state.lastAssetSymbol
            ? this.state.lastAssetSymbol
            : "A";

        if (fetchedAssets) {
            const lastAsset = fetchedAssets
                .sort((a, b) => {
                    if (a.symbol > b.symbol) {
                        return 1;
                    } else if (a.symbol < b.symbol) {
                        return -1;
                    } else {
                        return 0;
                    }
                })
                .last();
            searchAsset = lastAsset ? lastAsset.symbol : "A";
            this._updatePredictionMarketsList(fetchedAssets);
        }
        if (
            !this.state.lastAssetSymbol ||
            this.state.lastAssetSymbol !== searchAsset
        ) {
            AssetActions.getAssetList.defer(searchAsset, 100);
            this.setState({
                lastAssetSymbol: searchAsset
            });
        } else {
            this.setState({
                isFetchingFinished: true
            });
        }
    }

    _updatePredictionMarketsList(fetchedAssets) {
        const assets = fetchedAssets.filter(
            a =>
                a.bitasset_data &&
                a.bitasset_data.is_prediction_market &&
                a.bitasset_data.settlement_fund === 0
        );
        const predictionMarkets = [...assets].map(item => ({
            asset_id: item[1].id,
            issuer: item[1].issuer,
            description: assetUtils.parseDescription(
                item[1].options.description
            ).main,
            symbol: item[1].symbol,
            condition: assetUtils.parseDescription(item[1].options.description)
                .condition,
            expiry: assetUtils.parseDescription(item[1].options.description)
                .expiry,
            options: item[1].options
        }));

        if (
            this.state.predictionMarkets.length !== predictionMarkets.length &&
            this.state.isFetchingFinished
        ) {
            this.setState({
                selectedPredictionMarket: null,
                predictionMarkets
            });
        } else {
            this.setState({
                predictionMarkets
            });
        }
    }

    _updateOpinionsList(fetchedOpinions) {
        let orders = [];
        const selectedMarket = this.state.selectedPredictionMarket;
        fetchedOpinions.forEach((order, order_id) => {
            if (order.market_base === order.sell_price.base.asset_id) {
                //
            }
            let _selectedMarket = selectedMarket;
            console.log(order);
            const opinion =
                order.market_base === order.sell_price.base.asset_id
                    ? "yes"
                    : "no";
            const refPrice =
                order.market_base === order.sell_price.base.asset_id
                    ? order.sell_price.invert().toReal()
                    : order.sell_price.toReal();
            const amount =
                order.market_base === order.sell_price.base.asset_id
                    ? order.for_sale
                    : order.for_sale /
                      (order.sell_price.base.amount /
                          order.sell_price.quote.amount);
            const probability = refPrice * 100;

            const maxMarketFee = new Asset({
                amount: selectedMarket.options.max_market_fee,
                asset_id: selectedMarket.asset_id,
                precision: selectedMarket.precision
            });
            const marketFeePercent =
                selectedMarket.options.market_fee_percent / 100 + "%";
            const flagBooleans = assetUtils.getFlagBooleans(
                selectedMarket.options.flags,
                true
            );
            let fee = 0;
            if (flagBooleans["charge_market_fee"]) {
                fee = Math.min(
                    maxMarketFee.getAmount(),
                    (amount * selectedMarket.options.market_fee_percent) / 10000
                );
            }

            if (refPrice < 1) {
                orders.push({
                    order_id,
                    opinionator: order.seller,
                    opinion,
                    amount,
                    probability,
                    fee: fee
                });
            }
        });
        this.setState({opinions: [...orders]});
    }

    async getMarketOpinions(market) {
        if (this.state.subscribedMarket) {
            await MarketsActions.unSubscribeMarket(
                this.state.subscribedMarket.quote.get("id"),
                this.state.subscribedMarket.base.get("id")
            );
        }
        const base = ChainStore.getAsset(
            market.options.core_exchange_rate.base.asset_id
        );
        const quote = ChainStore.getAsset(
            market.options.core_exchange_rate.quote.asset_id
        );
        await MarketsActions.subscribeMarket(
            base,
            quote,
            this.props.bucketSize,
            this.props.currentGroupOrderLimit
        );
        this.setState({
            subscribedMarket: {
                base,
                quote
            }
        });
    }

    onMarketAction({market, action}) {
        if (typeof action === "string") {
            //on buttons action
            if (!this.state.selectedPredictionMarket) {
                this.setState({
                    selectedPredictionMarket: market
                });
            }

            switch (action) {
                case "resolve": {
                    this.setState({
                        preselectedAmount: 0,
                        preselectedProbability: 0
                    });
                    this.onResolveModalOpen();
                    break;
                }
                case "yes": {
                    if (this.state.subscribedMarket) {
                        this.setState({
                            preselectedAmount: 0,
                            preselectedProbability: 0,
                            preselectedOpinion: "yes"
                        });
                        this.onAddOpinionModalOpen();
                    }
                    break;
                }
                case "no": {
                    if (this.state.subscribedMarket) {
                        this.setState({
                            preselectedAmount: 0,
                            preselectedProbability: 0,
                            preselectedOpinion: "no"
                        });
                        this.onAddOpinionModalOpen();
                    }
                    break;
                }
                default: {
                    this.setState({
                        preselectedAmount: 0,
                        preselectedProbability: 0
                    });
                }
            }
        } else {
            //on row action
            if (this.state.selectedPredictionMarket) {
                this.setState({
                    selectedPredictionMarket: null
                });
            } else {
                this.setState(
                    {
                        selectedPredictionMarket: market
                    },
                    () => this.getMarketOpinions(market)
                );
            }
        }
    }

    onSearch(event) {
        this.setState({
            searchTerm: (event.target.value || "").toUpperCase()
        });
    }

    onSearchDetails(event) {
        this.setState({
            detailsSearchTerm: (event.target.value || "").toUpperCase()
        });
    }

    onCreatePredictionMarketModalOpen() {
        this.setState({
            isCreateMarketModalOpen: true
        });
    }

    onCreatePredictionMarketModalClose() {
        this.setState({
            isCreateMarketModalOpen: false
        });
    }

    onAddOpinionModalOpen() {
        this.setState({
            isAddOpinionModalOpen: true
        });
    }

    onAddOpinionModalClose() {
        this.setState({
            isAddOpinionModalOpen: false,
            preselectedOpinion: "no",
            preselectedAmount: 0,
            preselectedProbability: 0
        });
    }

    onResolveModalOpen() {
        this.setState({
            isResolveModalOpen: true
        });
    }

    onResolveModalClose() {
        this.setState({
            isResolveModalOpen: false
        });
    }

    handleUnknownHousesToggleChange() {
        const isHideUnknownHousesChecked = !this.state
            .isHideUnknownHousesChecked;
        this.setState({
            isHideUnknownHousesChecked,
            selectedPredictionMarket: null
        });
    }

    onOppose = opinion => {
        this.setState({
            preselectedOpinion: opinion.opinion === "no" ? "yes" : "no",
            preselectedAmount: opinion.amount,
            preselectedProbability: opinion.probability
        });
        this.onAddOpinionModalOpen();
    };

    onCancelOpinion = opinion => {
        this._cancelLimitOrders([opinion.order_id]);
    };

    _cancelLimitOrders(orderid) {
        MarketsActions.cancelLimitOrders(
            this.props.currentAccount.get("id"),
            orderid
        ).catch(err => {
            console.log("cancel orders error:", err);
        });
    }

    onSubmitNewOpinion = value => {
        if (this.state.opinions) {
            this.setState({
                opinions: [...this.state.opinions, value],
                isAddOpinionModalOpen: false
            });
        } else {
            this.setState({
                opinions: [value],
                isAddOpinionModalOpen: false
            });
        }
    };

    onResolveMarket = market => {
        const account = this.props.currentAccount;
        const globalSettlementPrice = market.result === "yes" ? 1 : 0;
        const asset = ChainStore.getAsset(market.asset_id).toJS();
        let base = new Asset({
            real: globalSettlementPrice,
            asset_id: asset.id,
            precision: asset.precision
        });
        let quoteAsset = ChainStore.getAsset(
            asset.bitasset.options.short_backing_asset
        );
        let quote = new Asset({
            real: 1,
            asset_id: asset.bitasset.options.short_backing_asset,
            precision: quoteAsset.get("precision")
        });
        let price = new Price({
            quote,
            base
        });

        AssetActions.assetGlobalSettle(asset, account, price).then(() => {
            let pause = new Promise(resolve => setTimeout(resolve, 1000));
            pause.then(result => {
                this.updateAsset(asset.symbol);
            });
        });
        this.setState({
            isResolveModalOpen: false
        });
    };

    updateAsset(symbol) {
        AssetActions.getAssetList.defer(symbol, 1);
    }

    getOverviewSection() {
        return (
            <div>
                <div
                    className="header-selector"
                    style={{display: "inline-block", width: "100%"}}
                >
                    <div className="filter-block">
                        <SearchInput
                            onChange={this.onSearch}
                            value={this.state.searchTerm}
                        />
                        <span>
                            <Switch
                                style={{marginLeft: "20px"}}
                                onChange={this.handleUnknownHousesToggleChange}
                                checked={this.state.isHideUnknownHousesChecked}
                            />
                            <Translate
                                content="prediction.overview.toggle_label"
                                style={{marginLeft: "10px"}}
                            />
                        </span>
                    </div>
                    <span className="action-buttons">
                        <Button
                            onClick={this.onCreatePredictionMarketModalOpen}
                        >
                            {counterpart.translate(
                                "prediction.overview.create_market"
                            )}
                        </Button>
                    </span>
                </div>
                <PredictionMarketsOverviewTable
                    predictionMarkets={this.state.predictionMarkets}
                    currentAccount={this.props.currentAccount}
                    onMarketAction={this.onMarketAction}
                    searchTerm={this.state.searchTerm}
                    selectedPredictionMarket={
                        this.state.selectedPredictionMarket
                    }
                    hideUnknownHouses={this.state.isHideUnknownHousesChecked}
                />
            </div>
        );
    }

    getDetailsSection() {
        const setOpinionFilter = e => {
            this.setState({
                opinionFilter: e.target.value
            });
        };
        return (
            <div>
                <div
                    className="header-selector"
                    style={{display: "inline-block", width: "100%"}}
                >
                    <div className="filter-block">
                        <SearchInput
                            onChange={this.onSearchDetails}
                            value={this.state.detailsSearchTerm}
                            autoComplete="off"
                        />
                        <Radio.Group
                            style={{marginLeft: "20px"}}
                            value={this.state.opinionFilter}
                            onChange={setOpinionFilter}
                        >
                            <Radio value={"all"}>
                                {counterpart.translate(
                                    "prediction.details.all"
                                )}
                            </Radio>
                            <Radio value={"yes"}>
                                {counterpart.translate(
                                    "prediction.details.yes"
                                )}
                            </Radio>
                            <Radio value={"no"}>
                                {counterpart.translate("prediction.details.no")}
                            </Radio>
                        </Radio.Group>
                    </div>
                    <span className="action-buttons">
                        <Button onClick={this.onAddOpinionModalOpen}>
                            {counterpart.translate(
                                "prediction.details.add_opinion"
                            )}
                        </Button>
                    </span>
                </div>
                {this.state.opinions ? (
                    <PredictionMarketDetailsTable
                        predictionMarketData={{
                            predictionMarket: this.state
                                .selectedPredictionMarket,
                            opinions: this.state.opinions
                        }}
                        currentAccount={this.props.currentAccount}
                        onOppose={this.onOppose}
                        onCancel={this.onCancelOpinion}
                        detailsSearchTerm={this.state.detailsSearchTerm}
                        opinionFilter={this.state.opinionFilter}
                    />
                ) : null}
            </div>
        );
    }

    render() {
        const symbols = [...this.props.assets].map(item => item[1].symbol);

        return (
            <div
                className="prediction-markets grid-block vertical"
                style={{overflow: "visible", margin: "15px"}}
            >
                <div
                    className="grid-block small-12 shrink"
                    style={{overflow: "visible"}}
                >
                    <HelpContent path={"components/PredictionMarkets"} />
                </div>
                {this.getOverviewSection()}
                {this.state.selectedPredictionMarket
                    ? this.getDetailsSection()
                    : null}
                {this.state.isCreateMarketModalOpen ? (
                    <CreateMarketModal
                        visible={this.state.isCreateMarketModalOpen}
                        onClose={this.onCreatePredictionMarketModalClose}
                        currentAccount={this.props.currentAccount}
                        symbols={symbols}
                        onMarketCreated={this.updateAsset}
                    />
                ) : null}
                {this.state.isAddOpinionModalOpen ? (
                    <AddOpinionModal
                        visible={this.state.isAddOpinionModalOpen}
                        onClose={this.onAddOpinionModalClose}
                        predictionMarket={this.state.selectedPredictionMarket}
                        opinion={this.state.initialOpinion}
                        currentAccount={this.props.currentAccount}
                        submitNewOpinion={this.onSubmitNewOpinion}
                        preselectedOpinion={this.state.preselectedOpinion}
                        preselectedAmount={this.state.preselectedAmount}
                        preselectedProbability={
                            this.state.preselectedProbability
                        }
                        baseAsset={this.state.subscribedMarket.base}
                        quoteAsset={this.state.subscribedMarket.quote}
                    />
                ) : null}
                {this.state.isResolveModalOpen ? (
                    <ResolveModal
                        visible={this.state.isResolveModalOpen}
                        onClose={this.onResolveModalClose}
                        predictionMarket={this.state.selectedPredictionMarket}
                        onResolveMarket={this.onResolveMarket}
                    />
                ) : null}
                {!this.state.isFetchingFinished ? (
                    <LoadingIndicator
                        loadingText={counterpart.translate(
                            "prediction.overview.loading"
                        )}
                    />
                ) : null}
            </div>
        );
    }
}

PredictionMarkets = connect(
    PredictionMarkets,
    {
        listenTo() {
            return [AssetStore, MarketsStore];
        },
        getProps() {
            return {
                assets: AssetStore.getState().assets,
                markets: MarketsStore.getState().marketData,
                bucketSize: MarketsStore.getState().bucketSize,
                currentGroupOrderLimit: MarketsStore.getState()
                    .currentGroupLimit,
                marketLimitOrders: MarketsStore.getState().marketLimitOrders
            };
        }
    }
);

export default (PredictionMarkets = bindToCurrentAccount(PredictionMarkets));
