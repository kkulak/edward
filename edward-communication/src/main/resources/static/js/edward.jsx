var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var browserHistory = ReactRouter.browserHistory;
var IndexRoute = ReactRouter.IndexRoute;
var NotFoundRoute = Router.NotFoundRoute;
var Link = ReactRouter.Link;
var LineChart = window['react-chartjs'].Line;
var BarChart = window['react-chartjs'].Bar;
var DateTimeField = window['ReactBootstrapDatetimepicker'];
var VOLUNTEER_COUNT_REFRESH_INTERVAL = 6000;

var PAGES = {
    ALL: 0, PROJECT: 1, JOB: 2, TASK: 3, EXECUTION: 4
};

function createCodeMirror(parentNode, selector, options) {
    var lastEditor = null;
    options = options || {isJson: false, isEditable: false}
    $(parentNode).find(selector).each(function (index, area) {
        lastEditor = CodeMirror.fromTextArea(area,
            {readOnly: !options.isEditable, lineNumbers: true, mode: {name: "javascript", json: options.isJson}})
    });
    return lastEditor;
}

var refreshNumberOfConnectedVolunteers = function () {
    getNumberOfConnectedVolunteers().done(function (data) {
        $("#connectedVolunteers").text(data);
    })
}


window.setInterval(refreshNumberOfConnectedVolunteers, VOLUNTEER_COUNT_REFRESH_INTERVAL);
refreshNumberOfConnectedVolunteers();
getVersion().done(function (data) {
    $("#version").text(data);
});


var Waiting = React.createClass({
    render: function () {
        return (
            <div>
                Waiting for data... </div>

        )
    }
})

var BreadCrumb = React.createClass({
    render: function () {
        var markup = [];
        var urlProperties = this.props.urlProperties;
        var getBreadcrumbPart = function (link) {
            return (
                <li key={link}>
                    <a href="#">
                        {link}
                    </a>
                </li>
            )
        };

        markup.push(getBreadcrumbPart(<Link to="/"> projects </Link>));
        if (urlProperties.projectId) {
            markup.push(getBreadcrumbPart(<Link to={"/project" + urlProperties.projectId}>
                project: {urlProperties.projectId}</Link>))
            if (urlProperties.jobId) {
                markup.push(getBreadcrumbPart(<Link to={"/job" + urlProperties.jobId}>
                    job: {urlProperties.jobId}</Link>))
                if (urlProperties.taskId) {
                    markup.push(getBreadcrumbPart(<Link to={"/task" + urlProperties.taskId}>
                        task: {urlProperties.taskId}</Link>))
                }
            }
        }
        return (
            <ol className="breadcrumb">
                {markup}
            </ol>
        );
    }
});
var GenericList = React.createClass({
    componentDidMount: function () {
        var that = this;
        this.props.getItemsFunction(this.props).then(function (items) {
            that.setState({items: items});
        })
    }, render: function () {
        if (!this.state) {
            return <Waiting/>
        } else {
            var that = this;
            var markup = this.state.items.map(function (item, idx) {
                var itemMarkup = that.props.itemToMarkupFunction(item, that.props);
                itemMarkup.key = idx;
                return itemMarkup;
            })
            if (this.state.items.length > 0) {
                return (
                    <table className="table">
                        <thead></thead>
                        <tbody>{markup}</tbody>
                    </table>);
            } else {
                return (
                    <div> No records to display. </div>
                )
            }
        }
    }

});

var projectListGetItems = function () {
    return getProjects();
};


var CellWithItemId = React.createClass({
    render: function () {
        return (<td>  &#35; {this.props.itemId} </td>);
    }
});


var projectListRenderItem = function (item) {
    return (<tr>
        <td>
            <Link to={"project/" + item.id}>{item.name}</Link>
        </td>
        <CellWithItemId itemId={item.id}/>
    </tr>
    )
};
var jobsListGetItems = function (props) {
    return $.ajax({
        type: "GET", url: BASE_API_URL + "/project/" + props.params.projectId + "/jobs", dataType: 'json', headers: {
            "Authorization": "Basic " + btoa("admin" + ":" + "admin")
        }
    })
}

var jobsListRenderItem = function (item) {
    return (<tr>
        <td>
            <Link to={"/project/" + item.projectId + "/job/" + item.id}>{item.name}</Link>
        </td>
        <CellWithItemId itemId={item.id}/>
    </tr>
    );
}

var tasksListGetItems = function (props) {
    return $.ajax({
        type: "GET", url: BASE_API_URL + "/job/" + props.params.jobId + "/tasks", dataType: 'json', headers: {
            "Authorization": "Basic " + btoa("admin" + ":" + "admin")
        }
    })
}

var tasksListRenderItem = function (item, props) {
    return (<tr>
        <td>
            <Link to={"/project/" + item.projectId + "/job/" + item.jobId + "/task/" + item.id}>&#35;{item.id}</Link>
        </td>
    </tr>);
}

var executionsListGetItems = function (props) {
    return $.ajax({
        type: "GET", url: BASE_API_URL + "/task/" + props.params.taskId + "/executions", dataType: 'json', headers: {
            "Authorization": "Basic " + btoa("admin" + ":" + "admin")
        }
    })
}

var executionsListRenderItem = function (item, props) {
    var date = new Date(0);
    date.setUTCMilliseconds(item.creationTime);
    if (item.status === "FINISHED") {
        var linkPart = (<Link
            to={"/project/" + props.projectId + "/job/" + props.jobId + "/task/" + item.taskId + "/execution/" + item.id}> {item.status} </Link> )
    } else {
        var linkPart = item.status;
    }
    return (<tr>
        <CellWithItemId itemId={item.id}/>
        <td>
            {linkPart}
        </td>
        <td> {item.error} </td>
        <td> {date.toLocaleDateString()} {date.toLocaleTimeString()}</td>

    </tr>);
}


var ProjectBox = React.createClass({
    contextTypes: {
        router: React.PropTypes.object.isRequired
    }, componentDidMount: function () {
        var that = this;
        getProject(this.props.params.projectId).then(function (project) {
            that.setState(project);
        })
    }, onJobAdd: function () {
        this.context.router.push("/project/" + this.props.params.projectId + "/job", this.props.params)
    }, render: function () {
        var disabled = !this.props.isEditable;
        return (
            this.state ? (<div>
                <h1> Project: {this.state.name} </h1>

                <div className="form-group">
                    <label htmlFor="id">Id: </label>
                    <input disabled={disabled} type="text" id="id" name="id" value={this.state.id}
                           className="form-control"/>
                    <label htmlFor="name">Name: </label>
                    <input disabled={disabled} type="text" id="name" name="name" value={this.state.name}
                           className="form-control"/>
                </div>
                <h2> Jobs </h2>
                <GenericList getItemsFunction={jobsListGetItems} itemToMarkupFunction={jobsListRenderItem}
                             params={this.props.params}/>
                <button className="btn" onClick={this.onJobAdd}> Add job</button>
            </div>
            ) : (
                <Waiting/>
            )
        );
    }
});

var AddProjectBox = React.createClass({
    contextTypes: {
        router: React.PropTypes.object.isRequired
    }, getInitialState: function () {
        return {
            ownerId: 1, id: null, name: ""
        }
    }, nameChange: function (event) {
        this.setState({
            name: event.target.value
        })
    }, addClick: function () {
        var that = this;
        putProject(this.state).then(function (idContainer) {
            that.context.router.replace("/");
        });
    }, render: function () {
        return (
            <div>
                <h1> Project: {this.state.name} </h1>

                <div className="form-group">
                    <label htmlFor="name">Name: </label>
                    <input type="text" id="name" name="name" value={this.state.name} onChange={this.nameChange}
                           className="form-control"/>
                    <button className="btn" onClick={this.addClick}> Add</button>
                </div>
            </div>

        );
    }
});


var JobBox = React.createClass({
    contextTypes: {
        router: React.PropTypes.object.isRequired
    }, componentDidMount: function () {
        var that = this;
        getJob(this.props.params.jobId).then(function (job) {
            that.setState(job);
        })
    }, onTasksAdd: function () {
        this.context.router.push(this.props.location.pathname + "/tasks", this.props.params);
    }, render: function () {
        return (
            this.state ? (<div>
                <h1>
                    Job: {this.state.name}</h1>

                <div className="form-group">
                    <label htmlFor="id">Id: </label>
                    <input disabled="true" type="text" id="id" name="id" value={this.state.id}
                           className="form-control"/>
                    <label htmlFor="projectId">Project id: </label>
                    <input disabled="true" type="text" id="projectId" name="projectId" value={this.state.projectId}
                           className="form-control"/>
                    <label htmlFor="name">Name: </label>
                    <input disabled="true" type="text" id="name" name="name" value={this.state.name}
                           className="form-control"/>
                </div>
                <h2> Tasks </h2>
                <GenericList getItemsFunction={tasksListGetItems} itemToMarkupFunction={tasksListRenderItem}
                             params={this.props.params}/>
                <button className="btn" onClick={this.onTasksAdd}> Add tasks</button>
                <h2> Code </h2>
                <pre>Please define function compute(input) </pre>
                <textarea id="codeArea">
                     {this.state.code}
                </textarea>

            </div>

            ) : (<Waiting/>)
        );
    }, componentDidUpdate: function () {
        createCodeMirror(ReactDOM.findDOMNode(this), "#codeArea", {isJson: false, isEditable: false});
    }
});


var AddJobBox = React.createClass({
    contextTypes: {
        router: React.PropTypes.object.isRequired
    }, getInitialState: function () {
        return {
            projectId: this.props.params.projectId, id: null, name: "", code: ""
        }

    }, nameChange: function (event) {
        this.setState({
            name: event.target.value
        })
    }, codeChange: function (codeMirror) {
        this.setState({
            code: codeMirror.getValue()
        })
    }, addClick: function (event) {
        var that = this;
        putJob(this.state).then(function () {
            that.context.router.push("project/" + that.props.params.projectId);
        })
    }, render: function () {
        return (
            this.state ? (<div>
                <h1>
                    Job: {this.state.name}</h1>

                <div className="form-group">
                    <label htmlFor="name">Name: </label>
                    <input onChange={this.nameChange} type="text" id="name" name="name" value={this.state.name}
                           className="form-control"/>
                </div>
                <h2> Code </h2>
                <pre>Please define function compute(input) </pre>
                <textarea id="codeArea"/>
                <button className="btn" onClick={this.addClick}> Add</button>

            </div>

            ) : (<Waiting/>)
        );
    }, componentDidMount: function () {
        var editor = createCodeMirror(ReactDOM.findDOMNode(this), "#codeArea", {isJson: false, isEditable: true});
        editor.on("change", this.codeChange)
    }
});

var TaskBox = React.createClass({
    componentDidMount: function () {
        var that = this;
        getTask(this.props.params.taskId).then(function (task) {
            return getData(task.inputDataId).then(function (data) {
                task.inputData = data.data;
                return task;
            })
        }).then(function (task) {
            that.setState(task);
        })
    }, dataChange: function (codeMirror) {
        this.setState({
            data: codeMirror.getValue()
        })
    }, render: function () {
        return (
            this.state ? (<div>
                <h1>
                    Task: {this.state.id}</h1>

                <div className="form-group">
                    <label htmlFor="id">Id: </label>
                    <input disabled="true" type="text" id="id" name="id" value={this.state.id}
                           className="form-control"/>
                    <label htmlFor="projectId">Project id: </label>
                    <input disabled="true" type="text" id="projectId" name="projectId" value={this.state.jobId}
                           className="form-control"/>
                    <label htmlFor="priority">Priority:</label>
                    <input disabled="true" type="text" id="priority" name="priority" value={this.state.priority}
                           className="form-control"/>
                    <label htmlFor="concurrentExecutions">Concurrent executions:</label>
                    <input disabled="true" type="text" id="concurrentExecutions" name="concurrentExecutions"
                           value={this.state.concurrentExecutionsCount} className="form-control"/>
                    <label htmlFor="timeout">Timeout:</label>
                    <input disabled="true" type="text" id="timeout" name="timeout" value={this.state.timeout}
                           className="form-control"/>
                    <label htmlFor="status">Status: </label>
                    <input disabled="true" type="text" id="status" name="status" value={this.state.status}
                           className="form-control"/>
                </div>
                <h2> Executions </h2>
                <GenericList getItemsFunction={executionsListGetItems} itemToMarkupFunction={executionsListRenderItem}
                             params={this.props.params}/>

                <h2> Input data </h2>
                <textarea id="dataArea">
                {JSON.stringify(JSON.parse(this.state.inputData), null, 2)}
                </textarea>
            </div>
            ) : (<Waiting/>)
        );
    }, componentDidUpdate: function () {
        createCodeMirror(ReactDOM.findDOMNode(this), "#dataArea", {isJson: true, isEditable: false});
    }
});


var AddTasksBox = React.createClass({
    contextTypes: {
        router: React.PropTypes.object.isRequired
    }, getInitialState: function () {
        return {priority: 0, concurrentExecutionsCount: 1, timeout: 5000, inputs: ""};
    }, dataChange: function (codeMirror) {
        console.log("setting state", codeMirror.getValue())
        this.setState({
            inputs: codeMirror.getValue()
        })
    }, priorityChange: function (event) {
        this.setState({priority: event.target.value})
    }, concurrentExecutionsChange: function (event) {
        this.setState({concurrentExecutionsCount: event.target.value})
    }, timeoutChange: function (event) {
        this.setState({timeout: event.target.value})
    }, addClick: function () {
        var that = this;
        putTasks(this.props.params.jobId, this.state.inputs, this.state.priority,
            this.state.concurrentExecutionsCount, this.state.timeout).then(function () {
                that.context.router.push("/project/" + that.props.params.projectId + "/job/" + that.props.params.jobId, that.props.params);
            })
    }, render: function () {
        return (
            <div>
                <h1>
                    Add new tasks</h1>

                <h2> Options </h2>

                <div className="form-group">
                    <label htmlFor="name">Priority</label>
                    <input onChange={this.priorityChange} type="number" id="priority" min="0" name="priority"
                           value={this.state.priority} className="form-control"/>
                    <label htmlFor="name">Number of concurrent executions</label>
                    <input onChange={this.concurrentExecutionsChange} type="number" id="priority" min="0"
                           name="priority" value={this.state.concurrentExecutionsCount} className="form-control"/>
                    <label htmlFor="name">Timeout [ms]</label>
                    <input onChange={this.timeoutChange} type="number" id="timeout" min="100" name="priority"
                           value={this.state.timeout} className="form-control"/>
                </div>
                <h2> Input data </h2>

                <div>Array of inputs, ex. [1,2,3]:</div>
                <textarea id="dataArea"/>
                <button className="btn" onClick={this.addClick}> Add Tasks</button>
            </div>

        );
    }, componentDidMount: function () {
        var editor = createCodeMirror(ReactDOM.findDOMNode(this), "#dataArea", {isJson: true, isEditable: true});
        editor.on("change", this.dataChange)
    }

});


var ExecutionBox = React.createClass({
    componentDidMount: function () {
        var that = this;
        var newState = null;
        getExecution(this.props.params.executionId).then(function (execution) {
            newState = execution;
            return getData(execution.outputDataId).then(function (data) {
                execution.result = data.data;
                return execution;
            }, function () {
                return execution;
            })
        }).always(function () {
            that.setState(newState);
        })
    }, render: function () {
        return (
            this.state ? (<div>
                <h1>
                    Execution: {this.state.id}</h1>

                <div className="form-group">
                    <label htmlFor="id">Id: </label>
                    <input disabled="true" type="text" id="id" name="id" value={this.state.id}
                           className="form-control"/>
                    <label htmlFor="taskId">Task id: </label>
                    <input disabled="true" type="text" id="taskId" name="taskId" value={this.state.taskId}
                           className="form-control"/>
                </div>
                <h2> Result </h2>
                <textarea id="dataArea">
                {this.state.result ? (JSON.stringify(JSON.parse(this.state.result), null, 2)) : ("No result.")}
                </textarea>
            </div>
            ) : (<Waiting/>)
        );
    }, componentDidUpdate: function () {
        createCodeMirror(ReactDOM.findDOMNode(this), "#dataArea", {isJson: true, isEditable: false});
    }
});


var AllProjectsBox = React.createClass({
    contextTypes: {
        router: React.PropTypes.object.isRequired
    }, onAdd: function () {
        this.context.router.push("add/project");
    }, render: function () {
        return (
            <div>
                <GenericList getItemsFunction={projectListGetItems} itemToMarkupFunction={projectListRenderItem}/>
                <button className="btn" onClick={this.onAdd}> Add project</button>
            </div>
        )
    }

});

var VolunteerChart = React.createClass({
    chartDataWith: function (data) {
        return {
            labels: data.map(entry => entry.date.format('DD-MM-YYYY h:mm:ss')),
            datasets: [{
                fillColor: "rgba(151,187,205,0.2)",
                strokeColor: "rgba(151,187,205,1)",
                pointColor: "rgba(151,187,205,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(151,187,205,1)",
                data: data.map(entry => entry.volunteers)
            }]
        }
    },
    render: function () {
        return (
            <LineChart className="chart" data={this.chartDataWith(this.props.data)} id={this.props.id}
                       width="800" height="450"/>
        );
    }
});


var SnapshotButton = React.createClass({
    getInitialState: function () {
        return {imageUrl: ''};
    },
    makeSnapshot: function () {
        var canvasId = this.props.canvasId;
        var canvasEl = document.getElementById(canvasId);
        this.setState({imageUrl: canvasEl.toDataURL('image/png')});
    },
    render: function () {
        return <a
            className="button float-right"
            href={this.state.imageUrl}
            target="_blank"
            onClick={this.makeSnapshot}
            >take snapshot</a>;
    }
});

// Really poor quality component
var DATE_FORMAT = 'DD-MM-YYYY HH:MM';
var DateTimeRangePicker = React.createClass({
    getInitialState: function() {
        return {
            startDate: moment().tz('Europe/Warsaw').subtract(7, 'days').format(DATE_FORMAT),
            endDate  : moment().tz('Europe/Warsaw').add(1, 'days').startOf('day').format(DATE_FORMAT)
        };
    },
    onStartDateChanged: function(date) {
        this.setState({ startDate: date });
    },
    onEndDateChanged: function(date) {
        this.setState({ endDate: date });
    },
    asDateObject: function(dateString) {
        return moment(dateString, DATE_FORMAT);
    },
    onRefreshClick: function() {
        this.props.onRefreshClick(
            this.asDateObject(this.state.startDate),
            this.asDateObject(this.state.endDate)
        );
    },
    render: function() {
        return (
            <div className="date-range-picker-container">
                <div className="date-picker-container">
                    <DateTimeField
                        dateTime={this.state.startDate}
                        maxDate={this.asDateObject(this.state.endDate)}
                        format={DATE_FORMAT}
                        inputFormat={DATE_FORMAT}
                        onChange={this.onStartDateChanged} />
                </div>
                <div className="date-picker-container">
                    <DateTimeField
                        dateTime={this.state.endDate}
                        minDate={this.asDateObject(this.state.startDate)}
                        format={DATE_FORMAT}
                        inputFormat={DATE_FORMAT}
                        onChange={this.onEndDateChanged}/>
                </div>
                <a  className="button"
                    onClick={this.onRefreshClick}>Refresh</a>
            </div>
        );
    }
});

var ActiveVolunteersChartContainer = React.createClass({
    getInitialState: function () {
        return {data: []};
    },
    updateState: function (volunteers) {
        var entry = {
            volunteers: volunteers,
            date: moment()
        };

        this.setState({data: this.state.data.concat([entry])});
    },
    fetchVolunteersAndUpdateState: function () {
        fetch('http://localhost:8080/api/internal/volunteerCount/', {
            headers: {
                "Authorization": "Basic " + btoa("admin:admin")
            }
        }).then(r => r.json())
            .then(this.updateState);
    },
    componentDidMount: function () {
        this.fetchVolunteersAndUpdateState();
        setInterval(this.fetchVolunteersAndUpdateState, this.props.fetchInterval);
    },
    render: function () {
        var chartId = 'volunteerChart';

        return (
            <div className="volunteerChart-container chart-container">
                <h2 className="chart-title">active volunteers</h2>
                <SnapshotButton canvasId={chartId}/>
                <VolunteerChart data={this.state.data} id={chartId}/>
            </div>
        );
    }
});

var VolunteerExecutionsChartContainer = React.createClass({
    getInitialState: function () {
        return {
            data: {
                labels: [],
                datasets: [{
                    fillColor: "rgba(151,187,205,0.2)",
                    strokeColor: "rgba(151,187,205,1)",
                    pointColor: "rgba(151,187,205,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(151,187,205,1)",
                    data: []
                }]
            }
        };
    },
    updateState: function (data) {
        this.setState({
            data: {
                labels: data.map(entry => entry.volunteerId),
                datasets: [{
                    fillColor: "rgba(151,187,205,0.2)",
                    strokeColor: "rgba(151,187,205,1)",
                    pointColor: "rgba(151,187,205,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(151,187,205,1)",
                    data: data.map(entry => entry.executionsCount)
                }]
            }
        });
    },
    fetchData: function (startDate, endDate) {
        var endpoint = 'http://localhost:8080/api/internal/metrics/volunteer-executions/';
        var params = 'type=' + this.props.type + '&from=' + startDate + '&to=' + endDate;
        return fetch(endpoint + '?' + params, {
            headers: {
                "Authorization": "Basic " + btoa("admin:admin")
            }
        }).then(r => r.json());
    },
    componentDidMount: function () {
        var startDate = moment().tz('Europe/Warsaw').subtract(7, 'days');
        var endDate = moment().tz('Europe/Warsaw').add(1, 'days').startOf('day');

        this.fetchAndUpdateState(startDate, endDate);
    },
    fetchAndUpdateState: function(startDate, endDate) {
        var formattedStartDate = startDate.toISOString();
        var formattedEndDate = endDate.toISOString();
        this.fetchData(formattedStartDate, formattedEndDate)
            .then(this.updateState);
    },
    render: function () {
        var chartId = this.props.type + '-' + Date.now();
        var options = {
            xAxisID: 'volunteer',
            yAxisID: 'executions'
        };

        return (
            <div className="volunteerChart-container chart-container">
                <h2 className="chart-title">{this.props.type} executions per volunteer</h2>
                <SnapshotButton canvasId={chartId}/>
                <DateTimeRangePicker onRefreshClick={this.fetchAndUpdateState} />
                <BarChart className="chart"
                          data={this.state.data}
                          options={options}
                          id={chartId}
                          width="800" height="450"/>

            </div>
        );
    }
});

var Container = React.createClass({
    render: function () {
        return (
            <div>
                <div className="block">
                    <h1 className="block-title">statistics</h1>
                    <ActiveVolunteersChartContainer fetchInterval={VOLUNTEER_COUNT_REFRESH_INTERVAL}/>
                    <VolunteerExecutionsChartContainer type="successful"/>
                    <VolunteerExecutionsChartContainer type="failing"/>
                </div>
                <div className="block">
                    <h1 className="block-title">projects</h1>
                    <BreadCrumb urlProperties={this.props.params}/>
                    {this.props.children}
                </div>
            </div>
        )
    }

});


var router = (
    <Router history={browserHistory}>
        <Route name="app" path="/" component={Container}>
            <Route path="project/:projectId" component={ProjectBox}/>
            <Route path="add/project" component={AddProjectBox}/>
            <Route path="project/:projectId/job" component={AddJobBox}/>
            <Route path="project/:projectId/job/:jobId/tasks" component={AddTasksBox}/>
            <Route path="project/:projectId/job/:jobId" component={JobBox}/>
            <Route path="project/:projectId/job/:jobId/task/:taskId" component={TaskBox}/>
            <Route path="project/:projectId/job/:jobId/task/:taskId/execution/:executionId" component={ExecutionBox}/>
            <IndexRoute component={AllProjectsBox}/>
        </Route>
    </Router>
);


ReactDOM.render(router, document.getElementById('currentContent'));